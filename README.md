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
| `product` | documento | `title`, `slug`, `visible`, `category` → `category`, `tags[]` → `tag`, `shortDescription`, `description`, `cardImage?`, `images[]` (≥1), `pricing`, `availability`, `sku?`, `variants[]?` |
| `category` | documento | Categoría principal (una por producto) |
| `tag` | documento | Etiquetas editoriales reutilizables (no repiten formato/color/acabado) |
| `homePage` | documento singleton | `featuredProducts[]` → `product` (orden = orden en la web, sin duplicados, solo publicados y visibles) |
| `siteSettings` | documento singleton | `contactEmail`, `socialLinks[]` |
| `productVariant` | objeto | `format`, `colour`, `finish` (texto libre, al menos uno), `sku?`, `hasOwnImages` + `images[]`, `hasOwnPricing` + `pricing`, `availability` (`inherit` por defecto) |
| `pricing` | objeto | `minimumPrice` > 0, `recommendedPrice` ≥ mínimo, `supportPrice` ≥ recomendado (EUR, 2 decimales) |
| `galleryImage` | objeto (imagen) | hotspot; `alt` obligatorio cuando hay imagen (una imagen opcional puede quedar vacía) |
| `socialLink` | objeto | `platform`, `url` (https) |

Navegación del Studio: **Tienda** (Productos, Categorías, Etiquetas) · **Web** (Página de inicio) · **Configuración** (Ajustes del sitio). `homePage` y `siteSettings` son singletons: no se pueden crear, duplicar ni borrar. La herramienta Vision (GROQ) solo aparece en local.

## Producto y versiones (contrato para frontend y Stripe)

- **Producto sin versiones** (`variants` vacío): el producto es lo que se vende. Su `images`, `pricing` y `availability` son los valores definitivos.
- **Producto con versiones**: las opciones que el cliente puede elegir y comprar son **las versiones**; el producto en sí no es una opción más. Los valores del producto (`images`, `pricing`, `availability`) son los valores por defecto compartidos. Cada versión puede sobrescribir:
  - galería, si `hasOwnImages == true` (usa `variant.images`);
  - precios, si `hasOwnPricing == true` (usa `variant.pricing`);
  - disponibilidad, si `availability != "inherit"`.
- La **identidad** de la versión (`format`, `colour`, `finish`) nunca se hereda: cada versión guarda explícitamente sus valores (ej. `A4 · Rojo · Mate`, o solo `Rojo` si basta). La etiqueta para el cliente es la unión de los valores presentes.
- La primera versión de la lista es la seleccionada por defecto. Hasta que se elige una versión con fotos propias, la ficha muestra la galería principal.
- Si `hasOwnImages`/`hasOwnPricing` está desactivado, cualquier dato antiguo en `images`/`pricing` de esa versión se debe **ignorar**.
- **Imagen de tarjeta** (catálogo y destacados): `cardImage` si existe; si no, `images[0]` (la galería principal es obligatoria).
- **Stripe (servidor)**: el mínimo autoritativo es `effectivePricing.minimumPrice` de la versión elegida (o del producto si no tiene versiones), leído en el servidor desde Sanity, nunca desde el navegador. Solo se puede comprar si la disponibilidad efectiva es `available`, el producto está publicado y `visible != false`.

Consulta GROQ de referencia (solo publicados):

```groq
*[_type == "product" && visible != false && slug.current == $slug][0]{
  _id, title, "slug": slug.current, shortDescription, description,
  "category": category->{title, "slug": slug.current},
  "tags": tags[]->{title, "slug": slug.current},
  "cardImage": coalesce(cardImage, images[0]),
  images, pricing, availability, sku,
  "variants": variants[]{
    _key, format, colour, finish, sku,
    "label": array::join(array::compact([format, colour, finish]), " · "),
    "images": select(hasOwnImages == true => images, ^.images),
    "pricing": select(hasOwnPricing == true => pricing, ^.pricing),
    "availability": select(availability == "inherit" || !defined(availability) => ^.availability, availability)
  }
}
```

Destacados de la home: `*[_id == "homePage"][0].featuredProducts[]->[visible != false]{...}` (las referencias apuntan a productos, no a versiones).
