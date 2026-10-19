import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetPassword } from "./reset-password.js";

const mocks = vi.hoisted(() => ({
  find: vi.fn(), claim: vi.fn<(input: { where: unknown; data: unknown }) => Promise<{ count: number }>>(), transaction: vi.fn(), updateUser: vi.fn(), revoke: vi.fn(), audit: vi.fn(), hash: vi.fn(),
}));
vi.mock("../../lib/audit.js", () => ({ writeAudit: mocks.audit }));
vi.mock("../../lib/password.js", () => ({ hashPassword: mocks.hash }));
vi.mock("../../lib/prisma.js", () => ({ prisma: {
  passwordResetToken: { findUnique: mocks.find }, $transaction: mocks.transaction,
} }));
const input = { token: "a".repeat(64), password: "A new password 123!" };
const record = { id: "token", userId: "user", usedAt: null, expiresAt: new Date(Date.now() + 60000) };
const tx = { passwordResetToken: { updateMany: mocks.claim }, user: { update: mocks.updateUser }, refreshToken: { updateMany: mocks.revoke } };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.find.mockResolvedValue(record);
  mocks.hash.mockResolvedValue("password-hash");
  mocks.claim.mockResolvedValue({ count: 1 });
  mocks.transaction.mockImplementation((work: (transaction: typeof tx) => Promise<void>) => work(tx));
});

describe("email setup and password recovery links", () => {
  it("consumes the link, invalidates other links, updates the password, and revokes sessions", async () => {
    await resetPassword(input);
    expect(mocks.claim.mock.calls[0][0]).toMatchObject({ where: { id: "token", usedAt: null } });
    expect(mocks.claim).toHaveBeenNthCalledWith(2, expect.objectContaining({ where: { userId: "user", usedAt: null } }));
    expect(mocks.updateUser).toHaveBeenCalledWith({ where: { id: "user" }, data: { passwordHash: "password-hash", activeSessionId: null } });
    expect(mocks.revoke).toHaveBeenCalled();
  });

  it.each([null, { ...record, usedAt: new Date() }, { ...record, expiresAt: new Date(0) }])("rejects missing, used, or expired links", async (value) => {
    mocks.find.mockResolvedValue(value);
    await expect(resetPassword(input)).rejects.toThrow("invalid or has expired");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects a link already claimed by a concurrent request", async () => {
    mocks.claim.mockResolvedValue({ count: 0 });
    await expect(resetPassword(input)).rejects.toThrow("invalid or has expired");
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
});
