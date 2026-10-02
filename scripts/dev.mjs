#!/usr/bin/env node
// Local dev runner: makes sure PostgreSQL is up, applies pending migrations,
// then runs the API (backend/) and web app (frontend/) side by side.
//
//   npm run dev        start everything (Ctrl+C stops API + web; the DB keeps running)
//   npm run db:start   start PostgreSQL only
//   npm run db:stop    stop PostgreSQL
//
// Env overrides: PG_BIN (folder with pg_ctl), PGDATA (cluster data dir), PGPORT.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createConnection } from "node:net";
import { createInterface } from "node:readline";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BACKEND = join(ROOT, "backend");
const FRONTEND = join(ROOT, "frontend");
const DB_PORT = Number(process.env.PGPORT ?? 5432);
const isWin = process.platform === "win32";

// Portable PostgreSQL (no admin rights) lives under %LOCALAPPDATA%; a regular
// installer puts it in Program Files and runs it as a Windows service instead.
const LOCAL_PG = join(process.env.LOCALAPPDATA ?? "", "Programs", "PostgreSQL", "17");
const PG_BIN = [process.env.PG_BIN, join(LOCAL_PG, "pgsql", "bin"), "C:\\Program Files\\PostgreSQL\\17\\bin"]
  .find((dir) => dir && existsSync(join(dir, isWin ? "pg_ctl.exe" : "pg_ctl")));
const PG_DATA = process.env.PGDATA ?? join(LOCAL_PG, "data");
const PG_LOG = join(dirname(PG_DATA), "postgres.log");

const children = [];
let stopping = false;

const log = (msg) => console.log(`\x1b[1m[dev]\x1b[0m ${msg}`);
function fail(msg) {
  console.error(`\x1b[31m[dev] ${msg}\x1b[0m`);
  process.exit(1);
}

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: "127.0.0.1" });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

// windowsHide (CREATE_NO_WINDOW) gives pg_ctl — and the postgres it launches — its own
// windowless console: nothing on screen to close, and Ctrl+C here never reaches it.
// Don't add `detached`: on Windows that means *no* console, so postgres would pop a
// visible console window whose close/Ctrl+C shuts the database down.
function pgCtl(...args) {
  if (!PG_BIN) fail("pg_ctl not found — install PostgreSQL 17 or set PG_BIN to its bin folder.");
  const bin = join(PG_BIN, isWin ? "pg_ctl.exe" : "pg_ctl");
  return new Promise((resolve) => {
    spawn(bin, ["-D", PG_DATA, ...args], { stdio: "ignore", windowsHide: true })
      .once("error", () => resolve(false))
      .once("exit", (code) => resolve(code === 0));
  });
}

// Reuse the npm that launched us (no shell, so Ctrl+C is clean); fall back to PATH.
function npm(args, cwd, stdio = "inherit") {
  const env = { ...process.env, FORCE_COLOR: "1" };
  const cli = process.env.npm_execpath;
  return cli
    ? spawn(process.execPath, [cli, ...args], { cwd, stdio, env })
    : spawn("npm", args, { cwd, stdio, env, shell: isWin });
}

function npmStep(args, cwd) {
  return new Promise((resolve) => {
    npm(args, cwd).once("exit", (code) =>
      code === 0 ? resolve() : fail(`npm ${args.join(" ")} failed in ${basename(cwd)}/`),
    );
  });
}

async function startDb() {
  if (await portOpen(DB_PORT)) return log(`PostgreSQL already running on :${DB_PORT}`);
  if (!existsSync(PG_DATA)) {
    fail(`PostgreSQL is not running on :${DB_PORT} and no data dir exists at ${PG_DATA}.\n` +
      "      Start your PostgreSQL service, or set PGDATA / PG_BIN.");
  }
  log("Starting PostgreSQL…");
  if (!(await pgCtl("-l", PG_LOG, "-o", `-p ${DB_PORT}`, "-w", "start"))) {
    fail(`PostgreSQL failed to start — see ${PG_LOG}`);
  }
  log(`PostgreSQL running on :${DB_PORT}`);
}

async function stopDb() {
  if (!(await portOpen(DB_PORT))) return log("PostgreSQL is not running.");
  const ok = await pgCtl("-m", "fast", "stop");
  log(ok ? "PostgreSQL stopped." : "Could not stop PostgreSQL (is it running as a Windows service?).");
}

async function prepare() {
  if (!existsSync(join(BACKEND, ".env"))) {
    fail("backend/.env is missing — copy backend/.env.example and set DATABASE_URL.");
  }
  for (const dir of [BACKEND, FRONTEND]) {
    if (existsSync(join(dir, "node_modules"))) continue;
    log(`Installing dependencies in ${basename(dir)}/…`);
    await npmStep(["install"], dir);
  }
  log("Generating Prisma client + applying pending migrations…");
  await npmStep(["run", "--silent", "db:generate"], BACKEND);
  await npmStep(["run", "--silent", "db:deploy"], BACKEND);
}

function startApp(name, cwd, color) {
  const child = npm(["run", "dev"], cwd, ["ignore", "pipe", "pipe"]);
  const prefix = `\x1b[${color}m[${name}]\x1b[0m `;
  for (const stream of [child.stdout, child.stderr]) {
    createInterface({ input: stream }).on("line", (line) => console.log(prefix + line));
  }
  child.once("exit", (code) => {
    if (stopping) return;
    log(`${name} exited with code ${code}; shutting down.`);
    shutdown(code ?? 1);
  });
  children.push(child);
}

function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    if (isWin) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill("SIGINT");
  }
  log("Stopped API + web. PostgreSQL is still running (npm run db:stop to stop it).");
  process.exit(code);
}

const command = process.argv[2] ?? "dev";
if (command === "db:stop") {
  await stopDb();
} else if (command === "db:start") {
  await startDb();
} else if (command === "dev") {
  await startDb();
  await prepare();
  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));
  startApp("api", BACKEND, 36);
  startApp("web", FRONTEND, 35);
  log("API → http://localhost:4000/api   Web → http://localhost:5173   (Ctrl+C to stop)");
} else {
  fail(`Unknown command "${command}". Use: dev | db:start | db:stop`);
}
