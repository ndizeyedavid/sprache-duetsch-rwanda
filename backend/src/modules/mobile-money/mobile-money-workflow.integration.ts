import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import request from "supertest";
import { createApp } from "../../app.js";
import { env } from "../../config/env.js";
import { signAccessToken } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { fakeXendly } from "./fake-xendly.fixture.js";
import { startCheckout } from "./mobile-money.service.js";
import { refreshCheckout } from "./refresh-checkout.js";
import { closeUnsubmittedCheckout, reconcileCheckout } from "./review-checkout.js";
import { settleCheckout } from "./settle-checkout.js";
import { acceptWebhook, processEvent, processStoredEvents } from "./webhook-inbox.js";
import { resetXendlyModeCache } from "./xendly-client.js";

assert.equal(env.NODE_ENV, "test", "Run with NODE_ENV=test against a disposable database");
assert.equal(env.XENDLYPAY_MODE, "test");
const stamp = `xendly-test-${randomUUID()}`;
const gateway = fakeXendly();
const originalFetch = globalThis.fetch;
globalThis.fetch = gateway.fetcher;
const users: string[] = []; const students: string[] = [];
const methodBefore = await prisma.paymentMethodConfig.findUnique({ where: { code: "XENDLYPAY" } });
let campusId: string | undefined;
const event = (data: unknown, type = "payment.succeeded") => ({ type, data });
const deliver = async (data: unknown, type?: string) => { const id = `${stamp}-${randomUUID()}`; await acceptWebhook(id, event(data, type)); await processEvent(id); };
const signed = (body: string) => { const t = Math.floor(Date.now() / 1000); return `t=${t},v1=${createHmac("sha256", env.XENDLYPAY_WEBHOOK_SECRET!).update(`${t}.${body}`).digest("hex")}`; };
const status = async (id: string) => (await prisma.paymentCheckout.findUniqueOrThrow({ where: { id } })).status;
try {
  campusId = (await prisma.campus.create({ data: { code: stamp, name: stamp } })).id;
  for (let i = 0; i < 2; i++) {
    const user = await prisma.user.create({ data: { email: `${stamp}-${i}@test.local`, firstName: "Xendly", lastName: "Fixture",
      passwordHash: "unused", role: "STUDENT", status: "ACTIVE", activeSessionId: stamp } }); users.push(user.id);
    const student = await prisma.student.create({ data: { userId: user.id, campusId, studentCode: `${stamp}-${i}`, status: "ACTIVE" } }); students.push(student.id);
    await prisma.charge.create({ data: { studentId: student.id, amount: 2000, description: "XendlyPay fixture" } });
  }
  const finance = await prisma.user.create({ data: { email: `${stamp}-finance@test.local`, firstName: "Finance", lastName: "Fixture",
    passwordHash: "unused", role: "FINANCE_ADMIN", status: "ACTIVE" } }); users.push(finance.id);
  const academic = await prisma.user.create({ data: { email: `${stamp}-academic@test.local`, firstName: "Academic", lastName: "Fixture",
    passwordHash: "unused", role: "ACADEMIC_ADMIN", status: "ACTIVE" } }); users.push(academic.id);
  const input = { amount: 100, phone: "0781234567", requestKey: randomUUID() };

  // A gateway app in the wrong mode is refused before anyone is prompted, and leaves no request behind.
  gateway.state.mode = "live"; resetXendlyModeCache();
  await assert.rejects(startCheckout(users[0], input), /being set up/);
  assert.equal(await prisma.paymentCheckout.count({ where: { studentId: { in: students } } }), 0);
  gateway.state.mode = "test"; resetXendlyModeCache();

  const concurrent = await Promise.all([startCheckout(users[0], input), startCheckout(users[0], input)]);
  const checkout = concurrent[0];
  assert.equal(checkout.id, concurrent[1].id); assert.equal(gateway.state.posts, 1);
  assert.equal(await prisma.payment.count({ where: { studentId: students[0] } }), 0, "pending is not paid");
  const competing = await Promise.allSettled([1, 2].map(() => startCheckout(users[1], { ...input, requestKey: randomUUID() })));
  const winner = competing.find(result => result.status === "fulfilled");
  assert.equal(competing.filter(result => result.status === "fulfilled").length, 1);
  assert.ok(winner && winner.status === "fulfilled");
  await deliver(gateway.set(winner.value.providerRef!, "failed", "Insufficient balance"), "payment.failed");
  const failedRow = await prisma.paymentCheckout.findUniqueOrThrow({ where: { id: winner.value.id } });
  assert.equal(failedRow.status, "FAILED"); assert.equal(failedRow.failureReason, "Insufficient balance");

  await assert.rejects(startCheckout(users[0], { ...input, requestKey: randomUUID() }), /awaiting confirmation/);
  await assert.rejects(startCheckout(users[0], { ...input, amount: 200 }), /different details/);
  await assert.rejects(refreshCheckout(checkout.id, students[1]), /not found/);
  const ref = (await prisma.paymentCheckout.findUniqueOrThrow({ where: { id: checkout.id } })).providerRef!;
  const paid = gateway.set(ref, "succeeded");
  await assert.rejects(settleCheckout({ ...paid, amount: 101 }), /different amount/);
  await assert.rejects(settleCheckout({ ...paid, msisdn: "250731234567" }), /different phone/);
  await assert.rejects(settleCheckout({ ...paid, mode: "live" }), /live mode/);
  await assert.rejects(settleCheckout({ ...paid, direction: "payout" }), /payout/);
  const settled = await Promise.all([settleCheckout(paid), settleCheckout(paid)]);
  assert.equal(settled[0]?.paymentId, settled[1]?.paymentId);
  assert.equal(await prisma.payment.count({ where: { studentId: students[0] } }), 1);
  assert.equal(await prisma.receipt.count({ where: { paymentId: settled[0]!.paymentId! } }), 1);
  assert.equal((await prisma.studentFinance.findUniqueOrThrow({ where: { studentId: students[0] } })).balance.toString(), "1900");
  await settleCheckout({ ...paid, status: "pending" });
  assert.equal(await status(checkout.id), "SUCCESSFUL", "a stale pending never reopens a paid request");

  const app = createApp();
  const bearer = (id: string, email: string, role: "STUDENT" | "FINANCE_ADMIN" | "ACADEMIC_ADMIN", sid?: string) => `Bearer ${signAccessToken(id, email, role, sid)}`;
  await request(app).get("/api/payments/mobile-money").set("Authorization", bearer(academic.id, academic.email, "ACADEMIC_ADMIN")).expect(403);
  await request(app).get("/api/payments/mobile-money").set("Authorization", bearer(users[0], `${stamp}-0@test.local`, "STUDENT", stamp)).expect(403);
  await request(app).get("/api/payments/mobile-money").set("Authorization", bearer(finance.id, finance.email, "FINANCE_ADMIN")).expect(200);
  await request(app).post("/api/payments/mobile-money/checkout").set("Authorization", bearer(finance.id, finance.email, "FINANCE_ADMIN")).send(input).expect(403);
  await request(app).get(`/api/payments/mobile-money/${checkout.id}`).set("Authorization", bearer(users[1], `${stamp}-1@test.local`, "STUDENT", stamp)).expect(404);
  await request(app).head("/api/payments/xendlypay/webhook").expect(200);
  const body = JSON.stringify(event(paid));
  await request(app).post("/api/payments/xendlypay/webhook").set("Content-Type", "application/json").send(body).expect(401);
  await request(app).post("/api/payments/xendlypay/webhook").set("Content-Type", "application/json")
    .set("X-Xendly-Signature", signed(body)).set("X-Xendly-Delivery", `${stamp}-http`).send(body).expect(200);
  const ping = JSON.stringify({ type: "ping", data: { message: "hello" } });
  await request(app).post("/api/payments/xendlypay/webhook").set("Content-Type", "application/json").set("X-Xendly-Signature", signed(ping)).send(ping).expect(200);
  await new Promise(resolve => setTimeout(resolve, 200));
  assert.ok((await prisma.paymentWebhookEvent.findUniqueOrThrow({ where: { id: `${stamp}-http` } })).processedAt, "signed duplicate processed once, harmlessly");
  assert.equal(await prisma.payment.count({ where: { studentId: students[0] } }), 1);

  // XendlyPay refuses outright (e.g. not a registered test number): the payer sees why and can try again.
  gateway.state.refuse = "250781234567 is not one of your test numbers";
  await assert.rejects(startCheckout(users[0], { ...input, requestKey: randomUUID() }), /not one of your test numbers/);
  gateway.state.refuse = null;
  const refused = await prisma.paymentCheckout.findFirstOrThrow({ where: { studentId: students[0], status: "FAILED" } });
  assert.match(refused.failureReason ?? "", /test numbers/);

  gateway.state.beforeReply = async payment => { await deliver(payment); };
  const early = await startCheckout(users[0], { ...input, requestKey: randomUUID() });
  gateway.state.beforeReply = null;
  assert.equal(early.status, "SUCCESSFUL", "a webhook that beats the create response still settles, and stays settled");

  const missed = await startCheckout(users[0], { ...input, requestKey: randomUUID() });
  gateway.set(missed.providerRef!, "succeeded");
  assert.equal((await refreshCheckout(missed.id)).status, "SUCCESSFUL", "polling recovers a missed webhook");

  gateway.state.timeout = true; gateway.state.landBeforeTimeout = true;
  const landed = await startCheckout(users[1], { ...input, requestKey: randomUUID() });
  assert.equal(landed.status, "UNKNOWN");
  const posts = gateway.state.posts;
  await startCheckout(users[1], { ...input, requestKey: landed.requestKey }); assert.equal(gateway.state.posts, posts, "same key never re-prompts");
  await assert.rejects(startCheckout(users[1], { ...input, requestKey: randomUUID() }), /awaiting confirmation/);
  gateway.state.timeout = false;
  const found = await refreshCheckout(landed.id);
  assert.equal(found.status, "PENDING"); assert.ok(found.providerRef, "a lost response is found again by reference");
  await deliver(gateway.set(found.providerRef, "cancelled"), "payment.failed");
  assert.equal(await status(landed.id), "FAILED");

  gateway.state.timeout = true; gateway.state.landBeforeTimeout = false;
  const lost = await startCheckout(users[1], { ...input, requestKey: randomUUID() });
  gateway.state.timeout = false;
  await assert.rejects(closeUnsubmittedCheckout(lost.id, "Checked dashboard: no payment", finance.id), /two minutes/);
  await prisma.paymentCheckout.update({ where: { id: lost.id }, data: { createdAt: new Date(Date.now() - 16 * 60_000) } });
  assert.equal((await refreshCheckout(lost.id)).status, "FAILED", "a request XendlyPay never saw is closed after 15 minutes");

  gateway.state.timeout = true;
  const recover = await startCheckout(users[1], { ...input, requestKey: randomUUID() });
  gateway.state.timeout = false;
  await prisma.paymentCheckout.update({ where: { id: recover.id }, data: { createdAt: new Date(Date.now() - 180000) } });
  await closeUnsubmittedCheckout(recover.id, "Checked dashboard and payer SMS: no debit", finance.id);
  assert.equal(await status(recover.id), "FAILED");

  gateway.state.timeout = true; gateway.state.landBeforeTimeout = true;
  const manual = await startCheckout(users[1], { ...input, requestKey: randomUUID() });
  gateway.state.timeout = false;
  const dashboardPayment = [...gateway.payments.values()].find(row => row.reference === manual.id)!;
  gateway.set(dashboardPayment.id, "succeeded");
  await assert.rejects(reconcileCheckout(manual.id, randomUUID(), "Payment id from dashboard", finance.id), /No XendlyPay payment/);
  const reconciled = await reconcileCheckout(manual.id, dashboardPayment.id, "Payment id from dashboard", finance.id);
  assert.equal(reconciled?.status, "SUCCESSFUL");
  await processStoredEvents();
  process.stdout.write("XendlyPay integration passed: mode guard, concurrent checkout, pending-is-not-paid, verified settlement, duplicate/out-of-order events, receipts, balance, signed webhooks, ping, refusals, early and missed webhooks, lost responses found by reference, auto-close, role boundaries and audited finance recovery.\n");
} finally {
  globalThis.fetch = originalFetch;
  const checkouts = await prisma.paymentCheckout.findMany({ where: { studentId: { in: students } }, select: { id: true, paymentId: true } });
  await prisma.paymentWebhookEvent.deleteMany({ where: { OR: [{ id: { startsWith: stamp } }, { providerRef: { in: [...gateway.payments.keys()] } }] } });
  await prisma.paymentCheckout.deleteMany({ where: { studentId: { in: students } } });
  await prisma.auditLog.deleteMany({ where: { entityId: { in: checkouts.flatMap(row => [row.id, row.paymentId ?? ""]) } } });
  await prisma.activityEvent.deleteMany({ where: { studentId: { in: students } } });
  await prisma.payment.deleteMany({ where: { studentId: { in: students } } });
  await prisma.charge.deleteMany({ where: { studentId: { in: students } } });
  await prisma.studentFinance.deleteMany({ where: { studentId: { in: students } } });
  await prisma.student.deleteMany({ where: { id: { in: students } } });
  await prisma.user.deleteMany({ where: { id: { in: users } } });
  if (!methodBefore) await prisma.paymentMethodConfig.deleteMany({ where: { code: "XENDLYPAY", payments: { none: {} } } });
  if (campusId) await prisma.campus.delete({ where: { id: campusId } });
  await prisma.$disconnect();
}
