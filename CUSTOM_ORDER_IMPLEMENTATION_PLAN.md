# PAWMOIRE — Custom Order Integration Plan (2026-11-25)

## Product direction
- Premium B2C personalized pet keepsakes are the homepage priority.
- Keep existing photography, typography, and layout where possible.
- B2B wholesale / general pet goods stay in a separate secondary section.
- Short customer journey: choose product → upload photo and details → select options → checkout → proof approval → production.

## Confirmed current implementation
- `index.html` includes the customization form: pet photo, email, pet name, preferences, notes and selected product options.
- `README.md` says photo previews and demo bag are browser-only; there is no real order submission, storage, payment, approval link or email.
- Shopify account currently cannot be used for checkout because the store is inactive and prompts for subscription.

## First production milestone: reliable customization intake
1. Choose and configure a backend and private object storage, with region/data retention appropriate for US buyers.
2. Create an authenticated, short-lived upload URL on the backend; upload image directly to private storage. Do not embed permanent storage credentials in the browser.
3. Validate file type by content and limit file size; strip EXIF location where practical; reject unsupported files.
4. Create a server-side `customization_id` with product ID, variant, pet name, email, customer notes, uploaded image key, created timestamp and status.
5. Return a receipt/reference to the customer and notify the merchant securely; do not email raw pet photos as public attachments.
6. Link `customization_id` to a Shopify cart/order once the store is activated; use Shopify checkout rather than storing card details.
7. Provide a merchant proof workflow: draft → proof sent → customer approved / revision requested → approved for production. Require an explicit customer approval action.
8. Add privacy notice, retention/deletion rules, and test failures/retries and mobile upload before launch.

## Acceptance tests
- Customer submits on desktop/mobile; merchant can retrieve photo and exact product options.
- Refresh, retries and duplicate clicks do not lose or duplicate an order.
- Wrong/missing image or invalid email produces a useful error.
- Unpaid draft does not appear as a paid order.
- Proof approval is logged; production cannot start before approval.
- Unauthorized users cannot access another customer's images.
- A real end-to-end test order passes after Shopify activation.

## Guardrails
- Do not imply demo checkout or local download is a live order.
- Do not add a public upload endpoint or expose credentials in frontend code.
- Do not activate paid services or subscriptions without owner approval.
- No production implementation is claimed complete by this plan.
