# PAWMOIRE V3 — Portable Source and Migration Guide

## What is backed up

This is a snapshot of **PAWMOIRE V3 · Customer Journey Plus**. It includes `index.html` (HTML, embedded CSS, embedded JavaScript) and the local image/SVG assets. The *original working front-end components* are sections and JavaScript routines in this file; this is **not** a React/Vue component library.

## Run locally

1. Unzip the archive. Open `index.html` in your desktop browser.
2. If local browser restrictions affect file handling or navigation, use `python3 -m http.server 8000` in the extracted directory, then open `http://localhost:8000`.
3. For deployment, upload the **extracted files and folders together**. Keep the `assets/` folder alongside `index.html`. Do not upload just `index.html` or images may break.

## Deploy to another platform

- Netlify: create a **new** site and upload the extracted folder as static files. Publish directory is the root directory.
- Cloudflare Pages / Vercel: create a static site with no framework build; publish `index.html` and `assets/` together.
- Ordinary web server: place the contents in a web root.
- Shopify: this static website cannot be imported as a complete Shopify theme or checkout integration. A separate Shopify theme/headless integration and backend implementation would be required.

This source snapshot is **not tied to Netlify**. Never confuse having a standalone static preview with having a production commerce backend.

## Editable product areas

- Product images: `assets/products-editable/p1-main.jpg` through `p8-main.jpg`.
- Product titles, prices and catalogue data: `const productsData` in `index.html`.
- Detail-page options, size, materials and copy: `const productFlowData` in `index.html`.
- Other hero, category and brand photos: `assets/photos/`, `assets/customer-products/`, `assets/portrait-inspiration/`.
- Brand logo: `assets/brand/PAWMOIRE-mark.svg`.

## What currently remains a DEMO

Real payment, Shopify order processing, persistent photo storage, backend order records, team design review, customer approval notifications and supplier dispatch are **not connected**. The project must not be advertised as accepting real orders until those are built and verified. Photo uploads may exist only in browser memory; they are not durable server records.

## Portability and security recommendations

- Preserve this archive unchanged as a snapshot, and commit extracted files to a dedicated private `PAWMOIRE-store` GitHub repository for version history. Do not mix it with the production code of `xinghe-ai`.
- Do not upload supplier credentials, API keys, customer photos or payment secrets to a Git repository.
- Create separate protected backend/storage when adding real customer order or image handling.
- Check commercial rights to every asset before public advertising. Original AI-generated product visuals are still mockups and should not be represented as manufactured products.
- Keep a second copy of the ZIP in personal offline storage.

## Validation

See `SHA256SUMS.txt` and `SOURCE_MANIFEST.json`. SHA-256 hashes help verify later transfers have not changed the files.
