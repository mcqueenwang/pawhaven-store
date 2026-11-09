# PAWMOIRE V3 — customer journey template

## Ready in this prototype
- Product cards open a product-detail view.
- Detail view includes product introduction, selectable size / finish / hardware, quantity, size guide, included-items note, materials, timing, shipping, FAQs and the five-step custom workflow.
- Optional multi-image gallery is supported. The main image is `assets/products-editable/pN-main.jpg`; add extra images as `pN-detail-1.jpg`, `pN-detail-2.jpg`, then add their paths to the matching product's `detailImages` array in `productsData`.
- Customer customization form collects original photo, contact email, pet name, photo framing preference, quantity and notes.
- It explicitly follows the manual workflow: PAWMOIRE staff prepares the design proof; customer approves the proof; production begins only after approval.
- A local demo bag stores selected options and a local design brief can be downloaded.

## Replace product images
Replace the files in `assets/products-editable/` while keeping the same names. The page layout does not need to change.

## Replace product information later
Edit `productsData` for product name, price, short description and image path. Edit `productFlowData` for long introduction, size options, finish, hardware, material, timing, shipping, included items, size guide and process wording.

## Important: not production-connected
This is a front-end prototype. Uploaded photos are previewed locally in the browser and included only if the customer downloads the local design brief. They are not sent to a server. The demo bag is in-memory only. Real payment, secure image storage, customer accounts, database-backed orders, staff review portal, email notifications, approval links and shipping integrations are not connected. No real orders or payments can be accepted.
