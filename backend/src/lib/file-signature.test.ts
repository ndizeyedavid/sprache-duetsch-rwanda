import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EXTENSION_BY_MIME, matchesFileSignature } from "./file-signature.js";

const dir = mkdtempSync(path.join(tmpdir(), "sig-"));
const write = (name: string, bytes: Buffer) => { const file = path.join(dir, name); writeFileSync(file, bytes); return file; };

describe("matchesFileSignature", () => {
  it("accepts real PNG and PDF bytes", async () => {
    expect(await matchesFileSignature(write("a", Buffer.from("89504e470d0a1a0a0000", "hex")), "image/png")).toBe(true);
    expect(await matchesFileSignature(write("b", Buffer.from("%PDF-1.7\n")), "application/pdf")).toBe(true);
  });
  it("rejects HTML declared as an image", async () => {
    expect(await matchesFileSignature(write("c", Buffer.from("<html><script>alert(1)</script>")), "image/png")).toBe(false);
  });
  it("recognises MP4 and WebM video", async () => {
    expect(await matchesFileSignature(write("d", Buffer.concat([Buffer.from("00000018", "hex"), Buffer.from("ftypmp42")])), "video/mp4")).toBe(true);
    expect(await matchesFileSignature(write("e", Buffer.from("1a45dfa30000", "hex")), "video/webm")).toBe(true);
  });
  it("never maps a type to an executable web extension", () => {
    expect(Object.values(EXTENSION_BY_MIME).some(ext => /html?|svg|js/.test(ext))).toBe(false);
  });
});
