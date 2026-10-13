import { Writable } from "node:stream";
import { pino } from "pino";
import { describe, expect, it } from "vitest";
import { REDACTED_PATHS } from "./log-redaction.js";

describe("logger redaction", () => {
  it("never writes bearer tokens, cookies or passwords", () => {
    let output = "";
    const sink = new Writable({ write(chunk: Buffer, _enc, done) { output += chunk.toString(); done(); } });
    const log = pino({ redact: { paths: REDACTED_PATHS, censor: "[redacted]" } }, sink);
    log.info({
      req: { headers: { authorization: "Bearer secret-access", cookie: "sid=secret-cookie", "user-agent": "test" } },
      res: { headers: { "set-cookie": "sid=secret-set" } },
      body: { password: "secret-password", refreshToken: "secret-refresh" },
    }, "request");
    expect(output).not.toMatch(/secret-/);
    expect(output).toContain("user-agent");
  });
});
