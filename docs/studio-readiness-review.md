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
1. Navigation: Tienda / Web / Configuración. The singletons don't appear in the "+" menu and can't be duplicated or deleted.
2. Create "UAT TEST" category and tag.
3. Create "UAT TEST" product with category, tag, card image, texts and two variants with different galleries, prices and availability. Check that each of these blocks publishing:
   - min 0;
   - recommended < min;
   - support < recommended;
   - a duplicate variant ("a5"/"negro" vs "A5"/"Negro");
   - missing alt text.
   Also check the visibility toggle and the previews.
4. Create one hidden product and one draft-only product. In Página de inicio:
   - add visible products and reorder them by drag;
   - check duplicates are prevented;
   - check the hidden and draft products are not offered.
5. Ajustes del sitio: check an invalid email, a non-https URL, a TikTok + instagram.com warning and a duplicate platform. Then discard the changes.
6. Cleanup: remove the homepage references, delete all UAT TEST documents, and delete the uploaded test assets from the media.
