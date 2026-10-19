import type { Application, Prisma } from "../../generated/prisma/client.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { queueAccountInvite } from "./account-invite.js";
import { createStudentAccount } from "./create-student-account.js";
import { ensureApplicantAccount } from "./ensure-applicant-account.js";

vi.mock("./account-invite.js", () => ({ queueAccountInvite: vi.fn() }));
vi.mock("./create-student-account.js", () => ({ createStudentAccount: vi.fn() }));

const user = { id: "new-user", email: "student@example.com", firstName: "Ada" };
const application = { id: "app", email: user.email, firstName: "Ada", campusId: null } as Application;
const created = { user, studentId: "student", studentCode: "SDR-test" } as Awaited<ReturnType<typeof createStudentAccount>>;
const makeClient = () => ({
  user: { findUnique: vi.fn().mockResolvedValue(null) },
  campus: { findFirst: vi.fn().mockResolvedValue({ id: "campus" }) },
});
const client = (tx: ReturnType<typeof makeClient>) => tx as unknown as Prisma.TransactionClient;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createStudentAccount).mockResolvedValue(created);
  vi.mocked(queueAccountInvite).mockResolvedValue({ emailQueued: true, emailConfigured: true, expiresAt: "later" });
});

describe("automatic applicant accounts", () => {
  it("creates a pending student and queues setup using the same transaction", async () => {
    const tx = makeClient();
    await ensureApplicantAccount(client(tx), application, "random-password-hash");
    expect(createStudentAccount).toHaveBeenCalledWith(tx, { ...application, campusId: "campus" }, "random-password-hash");
    expect(queueAccountInvite).toHaveBeenCalledWith(tx, user);
  });

  it("does not change an existing account or issue another setup token on retries", async () => {
    const tx = makeClient();
    tx.user.findUnique.mockResolvedValue({ id: "existing-user" });
    await ensureApplicantAccount(client(tx), application, "unused-hash");
    expect(createStudentAccount).not.toHaveBeenCalled();
    expect(queueAccountInvite).not.toHaveBeenCalled();
    expect(tx.campus.findFirst).not.toHaveBeenCalled();
  });

  it("uses the chosen campus when one was validated on the application", async () => {
    const tx = makeClient();
    await ensureApplicantAccount(client(tx), { ...application, campusId: "chosen" }, "hash");
    expect(tx.campus.findFirst).not.toHaveBeenCalled();
    expect(createStudentAccount).toHaveBeenCalledWith(tx, { ...application, campusId: "chosen" }, "hash");
  });

  it("fails before creating an account when no active campus exists", async () => {
    const tx = makeClient();
    tx.campus.findFirst.mockResolvedValue(null);
    await expect(ensureApplicantAccount(client(tx), application, "hash")).rejects.toThrow("temporarily unavailable");
    expect(createStudentAccount).not.toHaveBeenCalled();
    expect(queueAccountInvite).not.toHaveBeenCalled();
  });

  it("propagates an outbox failure so the surrounding transaction rolls back", async () => {
    vi.mocked(queueAccountInvite).mockRejectedValue(new Error("outbox unavailable"));
    await expect(ensureApplicantAccount(client(makeClient()), application, "hash")).rejects.toThrow("outbox unavailable");
  });
});
