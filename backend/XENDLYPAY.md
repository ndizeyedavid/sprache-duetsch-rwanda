# XendlyPay mobile-money collections

Students pay from **Profile → Payments** (or a public invoice link) with MTN MoMo or Airtel Money, through [XendlyPay](https://xendlypay.com/docs). Partial payments are whole RWF, minimum 100 RWF, at most the outstanding balance. A request that is still pending is never money: only a XendlyPay payment with status `succeeded` creates the ledger payment, receipt, audit and activity entries, atomically. Paypack was removed on 2026-10-19; its old records stay as history (`provider = "PAYPACK"`).

## Configuration (backend environment only)

```dotenv
XENDLYPAY_ENABLED=true
XENDLYPAY_API_KEY=xpay_…            # the app's key; never sent to browsers
XENDLYPAY_WEBHOOK_SECRET=…          # the app's webhook signing secret
XENDLYPAY_MODE=test                 # must equal the XendlyPay app's mode: test | live
```

- **Webhook URL** to set on the XendlyPay app: `https://class.deutschspracherw.org/api/payments/xendlypay/webhook`. XendlyPay does not follow redirects, so use exactly this host. Use **Send test** in the XendlyPay app; it must answer `200`.
- Until `XENDLYPAY_WEBHOOK_SECRET` is set the webhook answers `503`, so XendlyPay keeps retrying (about a day) and payments still settle through polling.
- **Mode guard.** Test-mode money cannot be withdrawn, so a deployment credits only payments made in `XENDLYPAY_MODE`. Before anyone is prompted, the API reads the app's mode (`GET /v1/balance`, cached 5 minutes) and refuses checkouts if it differs. **Going live:** switch the XendlyPay app to live, then set `XENDLYPAY_MODE=live` and redeploy the API. The key stays the same.
- In test mode only numbers on the XendlyPay test list can pay, and the payment page says so. Other numbers are refused with XendlyPay's message.

## How a payment flows

1. `POST /checkout` creates a `PaymentCheckout` and calls `POST /v1/payments` with `reference = checkout id` and `Idempotency-Key = checkout-<id>`, so a retry can never prompt the payer twice.
2. The student approves the PIN prompt. XendlyPay sends a signed `payment.succeeded` or `payment.failed` webhook.
3. The webhook verifies `X-Xendly-Signature` (`t=…,v1=HMAC-SHA256(secret, t + "." + raw body)`, constant-time, at most 5 minutes old), stores the event deduplicated on `X-Xendly-Delivery`, answers `200`, then settles.
4. Settlement checks the payment id, reference, amount, phone, direction, currency and mode against the checkout before crediting. Duplicate and out-of-order deliveries end in one payment and one receipt; a stale `pending` never reopens a closed request.
5. A minute job (`reconciliation.ts`) replays stored events, polls open requests (`GET /v1/payments/:id`), finds requests whose create response was lost by their reference, and closes requests XendlyPay never received after 15 minutes.

XendlyPay refusals (bad number, limits, not a test number) close the request as `FAILED` with the reason shown to the payer. A timeout or 5xx is `UNKNOWN`, never failed, because the payment may exist. Refunds are not sent through the API: the refund workflow records money returned outside the app.

## Endpoints

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/payments/mobile-money/config` | Student, Finance, Super Admin |
| POST | `/api/payments/mobile-money/checkout` | Student (own balance, 5/min) |
| GET | `/api/payments/mobile-money/me` | Student (latest 20) |
| GET | `/api/payments/mobile-money` | Finance, Super Admin (latest 100) |
| GET | `/api/payments/mobile-money/:id` | Owning student, Finance, Super Admin (refreshes status) |
| POST | `/api/payments/mobile-money/:id/reconcile` | Finance, Super Admin: XendlyPay payment id + reason, audited |
| POST | `/api/payments/mobile-money/:id/close` | Finance, Super Admin: confirmed no debit + reason, audited |
| HEAD/POST | `/api/payments/xendlypay/webhook` | XendlyPay, signed |
| GET/POST | `/api/invoices/:token[/pay]` | Holder of an emailed invoice link |

Code: `src/modules/mobile-money/` (`xendly-client.ts`, `mobile-money.service.ts`, `settle-checkout.ts`, `refresh-checkout.ts`, `webhook.routes.ts`, `webhook-inbox.ts`, `reconciliation.ts`, `review-checkout.ts`). Migration `20261019160000_xendlypay_gateway` adds `provider`/`failureReason`, replaces `PaypackEvent` with `PaymentWebhookEvent` (old events copied), closes open Paypack requests with an explanation and retires the `PAYPACK` method.

## Verification

```sh
cd backend
npx vitest run src/modules/mobile-money
NODE_ENV=test XENDLYPAY_ENABLED=true XENDLYPAY_API_KEY=xpay_fixture_key XENDLYPAY_WEBHOOK_SECRET=fixture XENDLYPAY_MODE=test \
  node --import tsx src/modules/mobile-money/mobile-money-workflow.integration.ts   # disposable DB, in-memory XendlyPay
```

The integration test (also in `npm run test:integration`) never calls the real gateway. Test-mode XendlyPay payments are real money from real phones, so test live only with small amounts and your own registered numbers.
