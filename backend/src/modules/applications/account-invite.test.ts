import { createHash } from "node:crypto";
import type { Prisma } from "../../generated/prisma/client.js";
import { describe, expect, it, vi } from "vitest";
import { queueAccountInvite } from "./account-invite.js";

vi.mock("../../config/env.js", () => ({ isProduction: true, env: { PUBLIC_APP_URL: "https://class.deutshsprache.org" } }));
vi.mock("../../lib/notification-delivery.js", () => ({ emailAvailable: () => true }));
vi.mock("../../lib/transactions.js", () => ({ transact: vi.fn() }));
vi.mock("./application-mail.js", () => ({ appUrl: () => "https://class.deutshsprache.org" }));
interface ResetRecord { data: { userId: string; tokenHash: string; expiresAt: Date } }
interface EmailRecord { data: { userId: string; email: string; eventKey: string; payload: { mail: { subject: string; text: string }; expiresAt: string } } }

describe("account verification invitations", () => {
  it("stores only a token hash and queues a private, expiring link to the real portal", async () => {
    const tokenCreate = vi.fn<(record: ResetRecord) => Promise<void>>().mockResolvedValue(undefined);
    const emailCreate = vi.fn<(record: EmailRecord) => Promise<void>>().mockResolvedValue(undefined);
    const tx = { passwordResetToken: { create: tokenCreate }, notificationDelivery: { create: emailCreate } } as unknown as Prisma.TransactionClient;
    const before = Date.now();
    const result = await queueAccountInvite(tx, { id: "user", email: "student@example.com", firstName: "Ada" });
    const tokenRecord = tokenCreate.mock.calls[0][0].data;
    const delivery = emailCreate.mock.calls[0][0].data;
    const url = new URL(delivery.payload.mail.text.match(/https:\/\/[^\s]+/)![0]);
    expect(url.origin).toBe("https://class.deutshsprache.org");
    expect(url.pathname).toBe("/reset-password");
    expect(url.searchParams.get("setup")).toBe("1");
    const token = url.searchParams.get("token")!;
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(tokenRecord.tokenHash).toBe(createHash("sha256").update(token).digest("hex"));
    expect(delivery.email).toBe("student@example.com");
    expect(delivery.eventKey).toBe(`account-invite:${tokenRecord.tokenHash}`);
    expect(tokenRecord.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 7 * 86400000);
    expect(delivery.payload.expiresAt).toBe(tokenRecord.expiresAt.toISOString());
    expect(result).not.toHaveProperty("setupUrl");
    expect(JSON.stringify(result)).not.toContain(token);
  });
});
