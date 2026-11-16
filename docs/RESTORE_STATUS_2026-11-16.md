# PAWMOIRE V3 static-site recovery status — 2026-11-16

## Recovery decision

The selected storefront brand is **PAWMOIRE**. This branch preserves the supplied PAWMOIRE V3 · Customer Journey Plus snapshot. No redesign, logo replacement, product-image replacement, or production-site overwrite was performed.

## Source identity

- Uploaded archive: `PAWMOIRE_V3_Source_2026-11-15.zip`
- Archive SHA-256: `e2e1bb5b17d13ae300ceb22d9aebfdc6354b20288151cac3e0232d7c7a8210d5`
- ZIP integrity test: passed
- Archive entries: 39 files
- GitHub repository: `mcqueenwang/pawhaven-store`
- Original source branch: `sync/pawmoire-v3-source-2026-11-15`
- GitHub archive blob SHA: `14033dabb222ba74df6d57508a991af5cd618a3e` (matches the uploaded archive's Git blob identity)
- The 39 files extracted from the supplied archive are present in the source branch with matching Git blob identities. The repository branch also contains the ZIP backup and a separate upload-check note.

## Static validation performed

- `SHA256SUMS.txt`: all 36 listed file checksums match.
- HTML parser: `index.html` parsed; 23 local `src`/`href` references checked; 0 missing local targets.
- Inline JavaScript: syntax check passed with Node.js `--check`.
- Image validation: 29 JPEG/PNG assets opened and verified; 0 corrupt images.
- Product catalogue: 8 product entries found.
- Collection routes in the source: `custom`, `wearables`, `toys`, `treats`.
- Static deployment settings: root publish directory, `index.html` entry, no build command.

## Important limits

This is a recovered **static storefront prototype**, not a live production commerce system. The source itself documents that:

- Photo uploads are previewed locally in the visitor's browser; they are not securely uploaded to a server.
- The shopping bag is in-memory demo state.
- Shopify checkout, payment collection, customer accounts, persistent order storage, staff approval portal, customer proof notifications, supplier dispatch, and shipping integration are not connected.
- No real orders or payments can be accepted from this snapshot.

A full browser-rendering / click-through smoke test was not completed in this recovery environment because the browser sandbox blocked local site navigation. Static file, asset, and JavaScript syntax checks passed; visual and interaction testing must still be completed in a normal browser after preview/deployment.

## Static hosting

Upload the extracted folder contents as a static site with the publish directory set to the folder containing `index.html`. No framework build command is required. Use a new preview/staging site first; do not overwrite the old PAWMOIRE site until visual review and a deployment target are confirmed.

## Next production work

1. Complete browser checks at desktop and mobile widths.
2. Confirm all product mockups and commercial asset rights before advertising.
3. Choose and configure a hosting provider/domain.
4. Build secure image upload, persistent order storage, staff proof review, customer approval, payment/checkout, and fulfillment integrations before accepting real orders.
