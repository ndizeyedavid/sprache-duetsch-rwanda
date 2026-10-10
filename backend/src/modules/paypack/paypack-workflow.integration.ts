import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import request from "supertest";
import { createApp } from "../../app.js";
import { env } from "../../config/env.js";
import { signAccessToken } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { startCheckout, refreshCheckout } from "./paypack.service.js";
import { closeUnsubmittedCheckout, reconcileCheckout } from "./review-checkout.js";
import { settleCheckout } from "./settle-checkout.js";
import { acceptWebhook, processStoredEvents } from "./webhook-inbox.js";

assert.equal(env.NODE_ENV, "test", "Run with NODE_ENV=test and test-only Paypack credentials");
const stamp = `paypack-test-${randomUUID()}`;
const originalFetch = globalThis.fetch;
const refs: string[] = [];
const users: string[] = [];
const students: string[] = [];
const checkoutIds: string[] = [];
const paymentIds: string[] = [];
const methodBefore = await prisma.paymentMethodConfig.findUnique({ where: { code: "PAYPACK" } });
let campusId: string | undefined;
let cashinCalls = 0;
let timeout = false;
let early = false;
let transactionTime: string | undefined;
let outcome: "successful" | "failed" = "successful";
const response = (body: unknown) => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });
const transaction = (ref: string, amount = 100, client = "0781234567") => ({ ref, kind: "CASHIN" as const, amount, client, status: outcome, created_at: transactionTime ?? new Date().toISOString() });
const event = (ref: string) => ({ event_id: `${stamp}-${ref}`, kind: "transaction:processed", data: transaction(ref) });
globalThis.fetch = async (url, init) => {
  const path = typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
  if (path.endsWith("/authorize")) return response({ access: "fixture-token" });
  if (path.includes("/events/transactions")) {
    const ref = new URL(path).searchParams.get("ref")!;
    return response({ transactions: [{ event_kind: "transaction:processed", data: transaction(ref) }] });
  }
  assert.ok(path.endsWith("/cashin"));
  cashinCalls++;
  if (timeout) throw new Error("Simulated lost provider response");
  const ref = `${stamp}-${cashinCalls}`; refs.push(ref);
  assert.equal(typeof init?.body, "string");
  const body = JSON.parse(init?.body as string) as { amount: number };
  if (early) await acceptWebhook(event(ref));
  return response({ ref, amount: body.amount, kind: "CASHIN", status: "pending" });
};
try {
  campusId = (await prisma.campus.create({ data: { code: stamp, name: stamp } })).id;
  for (let i = 0; i < 2; i++) {
    const user = await prisma.user.create({ data: { email: `${stamp}-${i}@test.local`, firstName: "Paypack", lastName: "Fixture",
      passwordHash: "unused", role: "STUDENT", status: "ACTIVE" } }); users.push(user.id);
    const student = await prisma.student.create({ data: { userId: user.id, campusId, studentCode: `${stamp}-${i}`, status: "ACTIVE" } }); students.push(student.id);
    await prisma.charge.create({ data: { studentId: student.id, amount: 2000, description: "Paypack fixture" } });
  }
  const finance = await prisma.user.create({ data: { email: `${stamp}-finance@test.local`, firstName: "Finance", lastName: "Fixture",
    passwordHash: "unused", role: "FINANCE_ADMIN", status: "ACTIVE" } }); users.push(finance.id);
  const academic = await prisma.user.create({ data: { email: `${stamp}-academic@test.local`, firstName: "Academic", lastName: "Fixture",
    passwordHash: "unused", role: "ACADEMIC_ADMIN", status: "ACTIVE" } }); users.push(academic.id);
  const input = { amount: 100, phone: "0781234567", requestKey: randomUUID() };
  const concurrent = await Promise.all([startCheckout(users[0], input), startCheckout(users[0], input)]);
  const checkout = concurrent[0]; checkoutIds.push(checkout.id);
  assert.equal(checkout.id, concurrent[1].id); assert.equal(cashinCalls, 1);
  assert.equal(await prisma.payment.count({ where: { studentId: students[0] } }), 0);
  const competing = await Promise.allSettled([
    startCheckout(users[1], { ...input, requestKey: randomUUID() }), startCheckout(users[1], { ...input, requestKey: randomUUID() }),
  ]);
  const winner = competing.find(result => result.status === "fulfilled");
  assert.equal(competing.filter(result => result.status === "fulfilled").length, 1);
  assert.ok(winner && winner.status === "fulfilled"); checkoutIds.push(winner.value.id);
  outcome = "failed"; await acceptWebhook(event(winner.value.providerRef!)); outcome = "successful";
  await assert.rejects(startCheckout(users[0], { ...input, requestKey: randomUUID() }), /awaiting confirmation/);
  await assert.rejects(startCheckout(users[0], { ...input, amount: 200 }), /different details/);
  await assert.rejects(refreshCheckout(checkout.id, students[1]), /not found/);
  const ref = (await prisma.paymentCheckout.findUniqueOrThrow({ where: { id: checkout.id } })).providerRef!;
  await assert.rejects(settleCheckout(transaction(ref, 101)), /does not match/);
  await assert.rejects(settleCheckout(transaction(ref, 100, "0731234567")), /does not match/);
  const settled = await Promise.all([settleCheckout(transaction(ref)), settleCheckout(transaction(ref))]);
  assert.equal(settled[0]?.paymentId, settled[1]?.paymentId); paymentIds.push(settled[0]!.paymentId!);
  assert.equal(await prisma.payment.count({ where: { studentId: students[0] } }), 1);
  assert.equal(await prisma.receipt.count({ where: { paymentId: settled[0]!.paymentId! } }), 1);
  assert.equal((await prisma.studentFinance.findUniqueOrThrow({ where: { studentId: students[0] } })).balance.toString(), "1900");
  const app = createApp();
  await request(app).get("/api/payments/paypack").set("Authorization", `Bearer ${signAccessToken(academic.id, academic.email, academic.role)}`).expect(403);
  await request(app).get("/api/payments/paypack").set("Authorization", `Bearer ${signAccessToken(users[0], `${stamp}-0@test.local`, "STUDENT")}`).expect(403);
  await request(app).get("/api/payments/paypack").set("Authorization", `Bearer ${signAccessToken(finance.id, finance.email, finance.role)}`).expect(200);
  await request(app).post("/api/payments/paypack/checkout").set("Authorization", `Bearer ${signAccessToken(finance.id, finance.email, finance.role)}`).send(input).expect(403);
  await request(app).post(`/api/payments/paypack/${checkout.id}/close`).set("Authorization", `Bearer ${signAccessToken(finance.id, finance.email, finance.role)}`)
    .send({ reason: "Unverified closure", confirmedNoDebit: false }).expect(400);
  await request(app).head("/api/payments/paypack/webhook").expect(200);
  await request(app).post("/api/payments/paypack/webhook").send(event(ref)).expect(401);
  const body = JSON.stringify(event(ref));
  const signature = createHmac("sha256", env.PAYPACK_WEBHOOK_SECRET!).update(body).digest("base64");
  await request(app).post("/api/payments/paypack/webhook").set("Content-Type", "application/json")
    .set("x-paypack-signature", signature).send(body).expect(200);
  await request(app).get(`/api/payments/paypack/${checkout.id}`).set("Authorization", `Bearer ${signAccessToken(users[1], `${stamp}-1@test.local`, "STUDENT")}`).expect(404);
  outcome = "failed";
  const failed = await startCheckout(users[0], { ...input, requestKey: randomUUID() }); checkoutIds.push(failed.id);
  await acceptWebhook(event(failed.providerRef!));
  assert.equal((await prisma.paymentCheckout.findUniqueOrThrow({ where: { id: failed.id } })).status, "FAILED");
  assert.equal(await prisma.payment.count({ where: { studentId: students[0] } }), 1);
  outcome = "successful"; early = true;
  const earlyCheckout = await startCheckout(users[0], { ...input, requestKey: randomUUID() }); checkoutIds.push(earlyCheckout.id);
  assert.equal(earlyCheckout.status, "SUCCESSFUL"); paymentIds.push(earlyCheckout.paymentId!);
  early = false;
  const missed = await startCheckout(users[0], { ...input, requestKey: randomUUID() }); checkoutIds.push(missed.id);
  const recovered = await refreshCheckout(missed.id);
  assert.equal(recovered.status, "SUCCESSFUL"); paymentIds.push(recovered.paymentId!);
  timeout = true;
  const unknown = await startCheckout(users[1], { ...input, requestKey: randomUUID() }); checkoutIds.push(unknown.id);
  assert.equal(unknown.status, "UNKNOWN");
  const calls = cashinCalls;
  await startCheckout(users[1], { ...input, requestKey: unknown.requestKey }); assert.equal(cashinCalls, calls);
  await assert.rejects(startCheckout(users[1], { ...input, requestKey: randomUUID() }), /awaiting confirmation/);
  await assert.rejects(closeUnsubmittedCheckout(unknown.id, "Verified no debit in provider history", finance.id), /two minutes/);
  await prisma.paymentCheckout.update({ where: { id: unknown.id }, data: { createdAt: new Date(Date.now() - 180000) } });
  await closeUnsubmittedCheckout(unknown.id, "Verified no debit in provider history", finance.id);
  const recoverUnknown = await startCheckout(users[1], { ...input, requestKey: randomUUID() }); checkoutIds.push(recoverUnknown.id);
  const recoveryRef = `${stamp}-recovery`; refs.push(recoveryRef);
  transactionTime = new Date(Date.now() - 86400000).toISOString();
  await assert.rejects(reconcileCheckout(recoverUnknown.id, recoveryRef, "Provider reference found", finance.id), /creation time/);
  transactionTime = undefined;
  const reconciled = await reconcileCheckout(recoverUnknown.id, recoveryRef, "Provider reference found", finance.id);
  assert.equal(reconciled?.status, "SUCCESSFUL"); paymentIds.push(reconciled.paymentId!);
  await processStoredEvents();
  process.stdout.write("Paypack integration passed: concurrent checkout, no pending ledger entries, signed callbacks, ownership, amount/phone verification, duplicate settlement, receipts, balance, failure, early webhook, missed webhook recovery, unknown request protection, role boundaries, and audited finance recovery.\n");
} finally {
  globalThis.fetch = originalFetch;
  await prisma.paypackEvent.deleteMany({ where: { providerRef: { in: refs } } });
  await prisma.paymentCheckout.deleteMany({ where: { studentId: { in: students } } });
  await prisma.auditLog.deleteMany({ where: { entityId: { in: [...paymentIds, ...checkoutIds] } } });
  await prisma.activityEvent.deleteMany({ where: { studentId: { in: students } } });
  await prisma.payment.deleteMany({ where: { studentId: { in: students } } });
  await prisma.charge.deleteMany({ where: { studentId: { in: students } } });
  await prisma.studentFinance.deleteMany({ where: { studentId: { in: students } } });
  await prisma.student.deleteMany({ where: { id: { in: students } } });
  await prisma.user.deleteMany({ where: { id: { in: users } } });
  if (!methodBefore) await prisma.paymentMethodConfig.deleteMany({ where: { code: "PAYPACK", payments: { none: {} } } });
  if (campusId) await prisma.campus.delete({ where: { id: campusId } });
  await prisma.$disconnect();
}
