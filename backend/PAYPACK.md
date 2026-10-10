# Paypack mobile-money collections

Students pay from **Profile → Payments** using MTN MoMo or Airtel Money. Partial payments are supported in whole RWF, with an application minimum of 100 RWF and an outstanding-balance limit. Pending requests are separate from received money. Confirmed payments generate the existing receipt, audit/activity entries and balance updates atomically.

## Activate later

1. Deploy the backend migration (`npm run db:deploy`) and generate its client (`npm run db:generate`). The local migration has already been applied.
2. Create a Paypack application with cashin and transaction-read permissions. Keep these settings in the backend environment only:

   ```dotenv
   PAYPACK_ENABLED=true
   PAYPACK_CLIENT_ID=your_application_client_id
   PAYPACK_CLIENT_SECRET=your_application_client_secret
   PAYPACK_WEBHOOK_SECRET=your_webhook_signing_secret
   PAYPACK_WEBHOOK_MODE=production
   ```

   Use `development` for local development. This is a webhook-routing mode, **not a promise of simulated money**. Keep the feature disabled until you are ready for real collections. Production mode is required when `NODE_ENV=production`.
3. In the Paypack application, configure an **active**, publicly accessible HTTPS webhook at:

   ```text
   https://YOUR_API_HOST/api/payments/paypack/webhook
   ```

   Match its mode to `PAYPACK_WEBHOOK_MODE`. The endpoint supports Paypack’s HEAD availability check and verifies POST signatures against the exact raw body using SHA-256 HMAC and constant-time comparison. API bearer authentication is not used for this provider callback.
4. Restart the API. The checkout automatically becomes available; credentials never reach the frontend. Before opening collections to students, make an authorized small payment and check its receipt, balance, Paypack reference and webhook result.

With `PAYPACK_ENABLED=false` (the default), the app starts without provider credentials and displays the existing manual-payment instructions.

## Reliability and operations

- The backend generates no automatic repeat debit after an uncertain outcome. The client supplies a UUID, transformed into a 32-character Paypack idempotency key. A retry returns the same checkout. Concurrent requests are serialized; each student has at most one unresolved checkout.
- Signed webhook events are persisted before processing. Early callbacks are replayed after the provider reference is saved. Duplicate callbacks and competing status checks produce a single ledger payment and receipt.
- The API verifies the reference, cashin kind, amount and payer phone before settlement. Missed callbacks are recovered from Paypack’s events API on status checks and by a minute scheduler independent of the reminder setting. A failed request never reduces the balance.
- A lost cashin response or process interruption becomes `UNKNOWN`. Finance/Super Admin can inspect the latest 100 requests on **Finance**, find the matching Paypack reference and reconcile it. Manual reconciliation checks phone, amount and creation time and records the actor/reason. Other roles cannot manage payment requests.
- If Paypack never accepted a request, finance can close an unknown request only after verifying no debit in the provider and payer histories, recording the verification details and waiting at least two minutes. A network error by itself is insufficient evidence.
- The `PAYPACK` ledger method is created on the first successful payment. Disabling it blocks new checkout requests; existing confirmed payments are still recorded. Gateway ledger amounts/references cannot be edited or voided. The existing refund workflow records money returned outside the application; **it does not initiate a Paypack cashout**. This integration collects tuition; payouts/cards/bank gateway processing are outside its scope.
- Application amounts represent the payer’s gross payment. Provider fees are not deducted from student tuition credit. Review settlement fees in the Paypack dashboard.

## Endpoints

| Method | Path (under `/api/payments/paypack`) | Access |
| --- | --- | --- |
| GET | `/config` | Student, Finance, Super Admin |
| POST | `/checkout` | Student (own balance, rate limited) |
| GET | `/me` | Student (own latest 20 requests) |
| GET | `/` | Finance, Super Admin (latest 100) |
| GET | `/:id` | Owning student, Finance, Super Admin |
| POST | `/:id/reconcile` | Finance, Super Admin |
| POST | `/:id/close` | Finance, Super Admin; confirmed no debit + reason |
| HEAD/POST | `/webhook` | Public HEAD / signed provider POST |

## Verification

Run backend typecheck/lint/tests and frontend build/lint. The database integration test uses disposable fixtures and mocked upstream responses (no real debit):

```sh
cd backend
NODE_ENV=test PAYPACK_ENABLED=true PAYPACK_CLIENT_ID=fixture PAYPACK_CLIENT_SECRET=fixture PAYPACK_WEBHOOK_SECRET=fixture npx tsx src/modules/paypack/paypack-workflow.integration.ts
```

Use only a local/test database for this script. It covers concurrent initiation and settlement, receipts/balances, ownership, signed callbacks, mismatched amounts/phones, failed payments, early/missed callbacks and uncertain-request protection.

Official references: [API](https://docs.paypack.rw/quickstart/api-reference), [authentication](https://docs.paypack.rw/quickstart/authentication), [webhooks](https://docs.paypack.rw/quickstart/webhooks), [events](https://docs.paypack.rw/quickstart/events).
