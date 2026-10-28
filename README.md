# Encrudo — Sanity Studio

Sanity Studio standalone para el proyecto Encrudo. El frontend (Vite + React) vive en [`Encrudo-Editorial-Hero`](https://github.com/Martro96/Encrudo-Editorial-Hero).

- **Project ID:** `apzq1m8q`
- **Dataset:** `production`

## Comandos

```bash
npm run dev      # Studio en local (http://localhost:3333)
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
| `siteSettings` | documento singleton | `contactEmail`, `socialLinks[]` |
| `productVariant` | objeto | `format`, `colour`, `finish` (texto libre, al menos uno), `sku?`, `images[]` (≥1), `pricing`, `availability` |
| `pricing` | objeto | `minimumPrice` > 0, `recommendedPrice` ≥ mínimo, `supportPrice` ≥ recomendado (EUR) |
| `galleryImage` | objeto (imagen) | hotspot + `alt` obligatorio |
| `socialLink` | objeto | `platform`, `url` (https) |

La primera variante de `variants` es la variante por defecto. Los productos destacados de la home se definirán como un array ordenado de referencias a `product` en un futuro singleton `homePage`.
