# Studio readiness review: admin panel phase

Scope: `Martro96/encrudo-sanity`, branch `devin/1793637422-admin-panel`. The frontend, Stripe and the contact form are out of scope and were not touched. Jorel is not involved in this phase.

## 1. Functional / UX readiness

### What was tested
| Check | Method | Result |
|---|---|---|
| Studio build | `npm run build` | Pass |
| TypeScript | `npx tsc --noEmit` | Pass |
| Schema | `npx sanity schema validate` | 0 errors, 0 warnings |
| Dev server against `development` | `SANITY_STUDIO_DATASET=development npm run dev` | Starts; title shows "Encrudo (development)"; stops at the Sanity login screen |
| Config/singleton/validation review | Static code review | See below |

### Editor UI UAT: NOT PERFORMED
The editor UI scenarios were **not executed and have not passed**:
- category, tag and two-variant product creation;
- galleries, pricing, duplicate variants, visibility and previews;
- homepage selection, ordering and filtering;
- site-settings validation.

The Studio running on Devin's VM needs an interactive Sanity login in that VM's browser, and the Desktop handoff wasn't available in Marta's Devin UI. As agreed, nobody shared a password or token and no tunnel was opened. Marta should run the UAT checklist (section 3) locally with `SANITY_STUDIO_DATASET=development npm run dev`.

No UAT documents or assets were created in either dataset, so there is nothing to clean up. An anonymous query shows `production` currently holds 0 published documents.

### Problems found and fixed in this phase
- Default/technical navigation replaced by Spanish structure: Tienda (Productos, Categorías, Etiquetas) · Web (Página de inicio) · Configuración (Ajustes del sitio). Spanish Studio locale added (`@sanity/locale-es-es`).
- `homePage` singleton added with only `featuredProducts`:
  - ordered and draggable;
  - `unique()` error on duplicates;
  - the picker excludes drafts, `visible == false` products and products already selected;
  - warning above 12 items;
  - async warning if a referenced product is later hidden.
- Singletons (`homePage`, `siteSettings`): removed from the global "new document" menu (`newDocumentOptions`) and from templates; document actions limited to publish / discard changes / restore (no duplicate or delete).
- Vision (GROQ tool) was shipped in the deployed Studio. It now loads only in local dev (`isDev`).
- Product editor:
  - grouped into Información / Textos / Imagen de tarjeta / Variantes y precios;
  - clearer Spanish help text;
  - the preview shows the category, the variant count and a hidden marker, and uses the card image with a fallback to the first variant image;
  - info message when no variant is available.
- Variants:
  - attributes grouped ("Qué distingue a esta variante");
  - SKU in a collapsed internal fieldset;
  - the preview shows the attributes and the min/recommended price in EUR;
  - duplicate combinations are rejected (case- and space-insensitive).
- Images: hotspot and asset-reuse explained; alt text required, max 160 characters.
- Site settings:
  - email validation message with an example;
  - social links as radio buttons (Instagram default, TikTok, YouTube, Otra);
  - https only;
  - warning when the platform doesn't match the URL host;
  - error for duplicate platforms.
- `@sanity/icons` root imports didn't resolve. They are now subpath imports.
- `process.env` dataset selection broke `tsc`. Fixed by adding `@types/node`.

### Remaining limitations
- All editor UI behaviour above is verified only by code review and schema validation, not in a browser. The highest-value items to check by hand:
  - the reference-picker filter on drafts and hidden products;
  - drag ordering;
  - the duplicate error;
  - the singleton menus.
- Hiding a product that is already featured gives a **warning**, not an error. The frontend must still filter `visible == true` when it queries.
- Whitespace in variant attributes is flagged by validation, not trimmed automatically.
- The local `sanity`/`@sanity/vision` version is 6.20.0, but `autoUpdates: true` serves runtime 6.21.0. Consider aligning local versions in a separate, non-breaking PR.

## 2. Security / configuration readiness

### Secrets review
- `git grep` for token/secret/password/api key/`sk_live`/`sk_test` finds nothing in tracked files.
- The only environment variable is `SANITY_STUDIO_DATASET`. It is a non-secret dataset name and defaults to `production`. No `VITE_*` variables. No tokens in the Studio or CLI config.
- `.gitignore` ignores `.env` and `.env.*`, except `.env.example` (which holds only the dataset name and a warning). `SANITY_STUDIO_*` values are bundled into the browser.

### Access model
- Authentication and roles are fully managed by Sanity (project members). The Studio contains no auth logic.
- The deployed Studio (`encrudo-admin.sanity.studio` via `studioHost`) is a public URL that serves only the login and Studio shell. Reading drafts or writing content requires a project member session.
- Project members couldn't be listed without authentication. Before integration, Marta should check in sanity.io/manage that only intended members exist, with least-privilege roles. No users have been invited in this phase.

### Dataset exposure (verified anonymously, no credentials)
- `production` is **public**: anonymous GROQ queries succeed (currently 0 documents). This is the intended model for a static Vite frontend. It means **everything published in `production` is world-readable**, so never publish non-public data there. Drafts are not readable anonymously.
- `development` returns `404 Dataset not found` to anonymous requests, the same response as a dataset that doesn't exist. This is consistent with Private, but whether it exists and is private can only be confirmed in sanity.io/manage.
- No schema exists for customer PII, addresses, orders, payments, contact submissions, Stripe/API secrets or auth tokens.

### CORS recommendations
Observed: `http://localhost:3333` is allowed **with credentials** (Sanity default). A random origin is not allowed.

| Origin | Credentials | Why |
|---|---|---|
| `http://localhost:3333` | Yes | Local Studio. Keep it while developing. |
| `https://encrudo-admin.sanity.studio` | Yes | Hosted Studio. Sanity handles `*.sanity.studio` on `sanity deploy`. |
| Public frontend production domain | **No** | Read-only, published content. |
| Frontend local dev (e.g. `http://localhost:5173`) and preview deploys | **No** | Read-only. Add only the exact origins, no wildcards. |

- Never add a wildcard origin, and never allow credentials for a frontend origin.
- If live preview of drafts is needed later, do it server-side with a viewer token, never with a browser token.

### Dependency / configuration findings
`npm audit`: 20 findings (17 moderate, 3 high). `npm audit fix` (non-breaking) changed nothing relevant; `--force` was not run. Dependency chains from `npm ls`:

| Package | Chain(s) | Runtime | Reachable in our deployment? | Upstream fix? |
|---|---|---|---|---|
| `js-yaml@3.13.1` (merge-key/omap CPU DoS, proto pollution) | `@sanity/cli@8.27.0 → @vercel/frameworks@3.29.0 (exact pin) → js-yaml` | CLI only (Node). Used by the CLI's framework detection (`detectFramework`/`frameworkPort`). Not in `dist/`. | Only by parsing YAML files in our own repo. An attacker would need write access to the repo. **Not reachable** | No: latest `@sanity/cli` 8.27.0 still uses `@vercel/frameworks` 3.29.0, and even the latest `@vercel/frameworks` (3.35.0) pins `js-yaml` 3.13.1 |
| `smol-toml@1.5.2` (malformed-TOML DoS) | `@sanity/cli → @vercel/frameworks@3.29.0 (exact pin) → smol-toml`. The CLI's direct `smol-toml@1.9.1` is not affected. | CLI only. Not in `dist/`. | Same as above, local trusted files only. **Not reachable** | No, same reason |
| `undici@7.29.1` (fixed in 7.30.1: TLS option drop, redirect cache poisoning, decompression DoS, …) | `sanity@6.20.0 → isomorphic-dompurify@2.36.0 → jsdom@28.1.0 → undici`; `@sanity/cli → @sanity/cli-build@7.1.0 → jsdom@29.1.1 → undici`; `@sanity/cli → @sanity/workbench-cli → @module-federation/vite → @module-federation/dts-plugin@2.9.2 (exact pin 7.29.1)`. The CLI's API client (`get-it`) already uses the fixed 7.30.1. | Node only. In the browser, `isomorphic-dompurify` resolves to `browser.js` (native DOMPurify, no jsdom/undici). Not in `dist/`. The deployed Studio loads `sanity` from `sanity-cdn.com` (auto-updates) anyway. | The browser Studio never loads undici. In CLI/build processes jsdom doesn't make outbound requests to attacker-controlled hosts, and Sanity API calls go through `get-it`, which already has the fix. **Not reachable** | Not via Sanity: `sanity` 6.21.0 still uses `isomorphic-dompurify` 2.36.0. `dts-plugin` pins 7.29.1 exactly. An npm `overrides` entry to `undici@7.30.1` (same major) is possible but optional. |

**Conclusion:** the 3 high findings are build/CLI-time tooling issues. None is an exploitable production risk for the deployed Studio or the public content API, so no mitigation is required before production. Re-check after future Sanity upgrades. The 17 moderate findings (largely `@oclif/*` under `@sanity/cli`) were not individually triaged.

### Must be resolved before connecting the public frontend
1. Run and pass the editor UI UAT checklist in `development`, then clean it up.
2. Confirm in sanity.io/manage:
   - `development` exists and is Private;
   - the project member list and roles are as intended.
3. Add the frontend origins to CORS **without credentials**.
4. The frontend must query only published content, with no token, filtering `visible == true` and dereferencing `homePage.featuredProducts`.
5. Decide whether to align local `sanity` with the auto-update runtime before `sanity deploy`.

## 3. Manual UAT checklist (development dataset)
Updated for the product-first editor. Use the `development` dataset only (`SANITY_STUDIO_DATASET=development npm run dev`) and prefix test content with "UAT TEST".
1. **Navigation:**
   - Tienda / Web / Configuración.
   - Singletons are not in the "+" menu and can't be duplicated or deleted.
   - Before the first publish, Página de inicio is titled "Página de inicio", not "Nuevo Página de inicio".
2. Create a "UAT TEST" category and tag.
3. **Simple product** (no versions):
   - fill in name, slug, category, Galería principal (1 photo with alt), prices and availability;
   - it publishes with no "Versiones" at all;
   - leaving "Imagen principal para catálogo" empty gives **no** error;
   - uploading one without alt text gives an error.
4. **Product with versions:** set a product gallery and prices, then add:
   - **A5 · Negro:** inherits everything;
   - **A5 · Rojo:** "usa fotos diferentes" with its own photos;
   - **A4 · Negro:** "tiene precios diferentes".
   Check that:
   - the previews say "fotos del producto / fotos propias / precios propios";
   - switching an override off hides its fields and doesn't block publishing;
   - a duplicate version ("a5"/"negro") is rejected;
   - versions that mix only-colour and only-format show a warning.
5. **Pricing:** each of these blocks publishing on both the product and a version with its own prices:
   - min 0;
   - recommended < min;
   - support < recommended;
   - 3 decimals.
6. **Página de inicio:**
   - add visible products and reorder them by drag;
   - duplicates are prevented;
   - hidden and draft-only products are not offered;
   - previews use the catalogue image or, failing that, the first gallery photo.
7. **Ajustes del sitio:** check an invalid email, a non-https URL, a TikTok + instagram.com warning and a duplicate platform. Then discard the changes.
8. **Cleanup:**
   - remove the homepage references;
   - delete all UAT TEST documents, including any created with the old variant structure, which will now show validation errors;
   - delete the uploaded test assets.

### 3b. Editor UX refinements (manual UAT — not executed by Devin)
Run these on the `studio-ux-refinements` branch with the `development` dataset only, before merging. The product-first branch still shows the old behaviour (the Generar button, selected tags still offered, "Añadir elemento").
1. **Slug, new product:**
   - type a name and the Dirección web fills in by itself, without pressing "Generar";
   - accents and spaces become e.g. `poster-ano-nuevo`;
   - the same happens in Categorías and Etiquetas.
2. **Slug, published product:** change the name and check that the Dirección web does **not** change. It can still be edited by hand.
3. **Tags:** add Tag A, then open the tag picker again. Tag A is no longer offered; other tags are still searchable.
4. **Duplicate tag:** force a duplicate (e.g. by pasting) and check that the "ya está añadida" error still appears.
5. **Gallery actions:**
   - under Galería principal there are "Seleccionar varias imágenes" and "Añadir imagen"/"Añadir otra imagen" buttons instead of "Añadir elemento";
   - drag several images onto the gallery at once;
   - use "Seleccionar varias imágenes" with multi-select in the file dialog;
   - repeat both in a version with "usa fotos diferentes".
6. **Gallery status:**
   - the line above the buttons reads e.g. "3 imágenes subidas · 1 sin texto alternativo. Los cambios se guardan automáticamente como borrador.";
   - each image in the list shows "Imagen lista" or "Falta texto alternativo";
   - an image without alt text blocks Publicar.
7. **Image editor:**
   - after an upload, open the image. Above Texto alternativo there is a green callout: "✓ Imagen guardada automáticamente", "Cuando termines, cierra esta ventana con la X.", "No necesitas pulsar «Publicar» para guardar la imagen."
   - the callout is clearly stronger than the alt-text help below it (smaller, muted);
   - the callout is not shown on an empty image slot;
   - add the alt text, close with X, and the item now shows "Imagen lista"; there is no extra Save button.
8. **Order:** drag images to reorder them. The first one is the main image, and the card preview uses it when there is no catálogo image.
9. **Draft vs Publish:**
   - the global switch at the top reads "Vista de trabajo" / "Web publicada", not "Borradores";
   - there is no Releases / "Publicaciones" or "Borradores programados" UI anywhere;
   - an edited document shows the "Cambios sin publicar" badge;
   - Página de inicio: remove a product from the list without publishing, then try to delete that product: it is still blocked;
   - publish Página de inicio, then try again: the deletion is now allowed.
10. **Código interno:** leave it empty on the product and on a version, and check that it publishes without errors. The label reads "Código interno" / "Código interno de esta versión".

### 3c. Editorial content (manual UAT — not executed by Devin)
Use the `development` dataset only.
1. **Navigation:** Web shows Página de inicio and Proyecto; there is no Puntos de venta. Proyecto cannot be created from "+", duplicated or deleted (only Publicar / Descartar cambios / Restaurar).
2. **Página de inicio · Introducción:**
   - fill in Título ("Encrudo se mueve"), Texto and Texto del enlace (prefilled "Más sobre Encrudo");
   - in Texto, select "cuadernos artesanales" and apply Destacado; the toolbar offers only Destacado (no colours, headings, links or lists);
   - Mayús+Intro creates a line break inside the paragraph;
   - leaving Título or Texto empty blocks Publicar; Productos destacados still works as before.
3. **Proyecto:**
   - fill in Frase de entrada (with "Encrudo" Destacado), Titular, Texto (2 paragraphs), Cita and the 7 Principios (Primera frase + Continuación), and reorder Principios by dragging;
   - a second paragraph in Frase de entrada is rejected;
   - the document is titled "Proyecto" before and after publishing.
4. **Ajustes del sitio · Explicación del rango de precio:**
   - write a text that mentions precio mínimo / recomendado / de apoyo and choosing how much to pay, using a bullet list and Destacado;
   - the help text says not to enter amounts here;
   - empty blocks Publicar.
5. **Product description:** Descripción corta's help mentions the shop and homepage cards, and Descripción completa's help mentions the product page. There is no new description field.

### 3d. Homepage featured product or version (manual UAT — not executed by Devin)
Use the `development` dataset only. Prepare 2 published products: "Cuaderno X" with versions "A5 · Rojo · Mate" (own photos, own prices) and "Negro" (inherits everything), and "Póster Y" with no versions.
1. **Old data:** if Página de inicio already has featured products from before this change, they show as invalid. Run the dry run of `featured-products-items` from the README, then `--no-dry-run`; the items reappear in the same order as "Cuaderno X — Producto principal". (Or remove them and add them again.)
2. **Add a product:** in Productos destacados, add an item. Only Producto is visible, with help "Elige el producto que quieres destacar."; drafts and hidden products are not offered.
3. **Version selector:** pick Cuaderno X. Versión destacada appears with its help text and lists only "A5 · Rojo · Mate" and "Negro" plus "Producto principal (sin versión concreta)".
4. **No versions:** pick Póster Y in another item. Versión destacada shows "Este producto no tiene versiones publicadas: se mostrará el producto principal." and nothing can be selected.
5. **Preview:** the items read "Cuaderno X · A5 · Rojo · Mate — Versión destacada" (thumbnail = the red version's first photo), "Cuaderno X · Negro" (thumbnail = product image) and "Póster Y — Producto principal".
6. **Changing product clears the version:** in the A5 · Rojo · Mate item, switch Producto to Póster Y. Versión destacada is emptied, not kept.
7. **Obsolete version:** feature "Cuaderno X · Negro", publish the homepage, then delete the Negro version from Cuaderno X and publish the product. Back in Página de inicio, the item shows "La versión seleccionada ya no existe" in the preview and the error "La versión seleccionada ya no existe en este producto. Elige otra versión o deja el campo vacío." Choosing another version or "Producto principal" fixes it.
8. **Duplicates:** the same product twice with no version, or the same version twice, gives "Este producto (o esta versión) ya está en la lista…". Cuaderno X as main product plus Cuaderno X · A5 · Rojo · Mate is allowed.
9. **Product still required:** an item without Producto blocks Publicar with "Elige el producto que quieres destacar".
10. Drag to reorder still works; hiding a featured product still gives the "ocultos en el catálogo" warning.
11. Clean up the test products and homepage items in `development` afterwards.

