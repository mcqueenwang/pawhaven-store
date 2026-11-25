# PAWMOIRE photo intake and proof review deployment notes

This feature branch contains a private Cloudflare Worker intake API and a customer proof-review page. It is **not deployed** and must not be treated as a live store.

## Required Worker bindings and secrets

Configure these exact binding names on the Worker:

- R2 bucket binding: `PHOTOS` (private bucket; do not enable public access)
- KV namespace binding: `ORDERS`
- Secret: `ADMIN_TOKEN` (random value of at least 32 characters)
- Variable: `ALLOWED_ORIGIN` (exact storefront origin, e.g. `https://shop.example.com`, with no trailing slash)

Cloudflare references: [R2 Worker bindings](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) and [KV bindings](https://developers.cloudflare.com/kv/concepts/kv-bindings/).

## Storefront configuration

Before the main inline application script runs, define the Worker origin:

```html
<script>window.PAWMOIRE_API_BASE = "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev";</script>
```

Use the actual deployed Worker origin. Do not put `ADMIN_TOKEN`, R2 credentials, or any privileged secret in storefront code. The browser submits the selected image as multipart form data to `POST /api/customizations`.

## Intake API

`POST /api/customizations` accepts multipart fields:

- `photo`: JPEG, PNG or WebP, up to 8 MB
- `productId`: p1 through p8
- `quantity`: 1 through 20
- `customerEmail`, `petName`, `photoPreference`, `notes`
- `selectedOptions`: JSON object
- `photoConsent`: literal `true`

The response returns a `customizationId` and explicitly states that payment has not been taken.

## Merchant proof workflow

All merchant endpoints require `Authorization: Bearer ADMIN_TOKEN`.

1. Read a request: `GET /api/admin/customizations/{customizationId}`
2. Retrieve the original photo: `GET /api/admin/customizations/{customizationId}/photo`
3. Upload the finished proof as multipart field `proof`: `POST /api/admin/customizations/{customizationId}/proof`
4. Send the returned private `proofUrl` to the customer's verified email using an approved email service.

The proof endpoint accepts JPEG, PNG or WebP up to 8 MB. The generated review link expires after 14 days.

## Customer review

The deployed `proof-review.html` page lets the customer:

- View the proof through a token-protected image endpoint.
- Explicitly approve the design.
- Request a revision with written notes.

Approval and revision decisions are recorded against the customization record. Production must not start before an explicit `approved` status.

## Important production gaps

- No Worker deployment or Cloudflare resource binding has been performed by this commit.
- No admin dashboard, email sender, Shopify checkout/order integration, payment, fulfillment, or production dispatch is connected.
- KV is used as the prototype request index; it is not a transactional order/payment ledger. Replace it with a durable database before relying on it for high-value order state.
- Configure rate limiting, retention/deletion procedures, operational alerts, and verified customer-email delivery before public launch.
- Confirm the storefront's exact origin in `ALLOWED_ORIGIN`. The Worker will reject browser POST requests from other origins.

## Acceptance checks before launch

1. Upload valid JPEG/PNG/WebP from desktop and mobile; confirm an intake ID is returned.
2. Reject a renamed non-image file, oversized image, missing consent, invalid email and invalid product ID.
3. Confirm the R2 bucket is private and unauthenticated access to original photos fails.
4. Confirm one customer's admin credentials cannot be exposed in frontend assets.
5. Upload a proof; open the customer link in a separate browser; confirm the image loads.
6. Approve and request revision in separate test requests; confirm the recorded status and timestamps.
7. Confirm invalid/expired/reused tokens cannot read proofs or submit another decision.
8. Confirm production operations are blocked until approval and payment/order linkage is independently verified.
