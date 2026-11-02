# Encrudo — Sanity Studio

Sanity Studio standalone para el proyecto Encrudo. El frontend (Vite + React) vive en [`Encrudo-Editorial-Hero`](https://github.com/Martro96/Encrudo-Editorial-Hero).

- **Project ID:** `apzq1m8q`
- **Dataset:** `production` (contenido real) · `development` (privado, solo pruebas internas)
- **Studio desplegado (previsto):** https://encrudo-admin.sanity.studio (`studioHost` en `sanity.cli.ts`)

El dataset se elige con `SANITY_STUDIO_DATASET` (por defecto `production`). Ver `.env.example`.
Las variables `SANITY_STUDIO_*` se incluyen en el bundle del navegador: **nunca** pongas tokens ni credenciales en ellas.

## Comandos

```bash
npm run dev      # Studio en local (http://localhost:3333) contra production
SANITY_STUDIO_DATASET=development npm run dev   # pruebas internas / UAT
npm run build    # Build del Studio a dist/
npm run deploy   # Deploy a *.sanity.studio
```

Los schemas se definen en `schemaTypes/` y se exportan desde `schemaTypes/index.ts`.

## Modelo de datos

| Tipo | Clase | Notas |
|---|---|---|
| `product` | documento | `title`, `slug`, `visible`, `cardImage?`, `shortDescription`, `description`, `variants[]` (≥1), `category` → `category`, `tags[]` → `tag` |
| `category` | documento | Categoría principal (una por producto) |
| `tag` | documento | Etiquetas reutilizables (varias por producto) |
| `homePage` | documento singleton | `featuredProducts[]` → `product` (orden = orden en la web, sin duplicados, solo publicados y visibles) |
| `siteSettings` | documento singleton | `contactEmail`, `socialLinks[]` |
| `productVariant` | objeto | `format`, `colour`, `finish` (texto libre, al menos uno), `sku?`, `images[]` (≥1), `pricing`, `availability` |
| `pricing` | objeto | `minimumPrice` > 0, `recommendedPrice` ≥ mínimo, `supportPrice` ≥ recomendado (EUR) |
| `galleryImage` | objeto (imagen) | hotspot + `alt` obligatorio |
| `socialLink` | objeto | `platform`, `url` (https) |

La primera variante de `variants` es la variante por defecto. Los productos destacados de la home son el array ordenado `homePage.featuredProducts`.

Navegación del Studio: **Tienda** (Productos, Categorías, Etiquetas) · **Web** (Página de inicio) · **Configuración** (Ajustes del sitio). `homePage` y `siteSettings` son singletons: no se pueden crear, duplicar ni borrar. La herramienta Vision (GROQ) solo aparece en local.
