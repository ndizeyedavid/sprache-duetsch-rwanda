import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app.js";

vi.hoisted(() => {
  vi.stubEnv("PAYPACK_ENABLED", "false");
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/cors_test");
  vi.stubEnv("JWT_SECRET", "cors-test-secret-long-enough");
  vi.stubEnv("CORS_ORIGINS", "http://localhost:5173");
  vi.stubEnv("ENROLLMENT_ALLOWED_ORIGINS", "");
});

const app = createApp();

describe("marketing website enrollment preflight", () => {
  it.each(["https://deutshsprache.org", "https://www.deutshsprache.org"])("allows JSON submissions from %s", async (origin) => {
    const response = await request(app).options("/api/applications")
      .set("Origin", origin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");
    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(origin);
    expect(response.headers["access-control-allow-headers"]).toContain("content-type");
  });

  it("does not allow unrelated websites", async () => {
    const response = await request(app).options("/api/applications")
      .set("Origin", "https://untrusted.example")
      .set("Access-Control-Request-Method", "POST");
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
