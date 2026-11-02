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
| `homePage` | documento singleton | Introducción: `introHeading`, `introText` (texto editorial), `introLinkLabel` (el destino /proyecto lo fija la web) · `featuredProducts[]` de `featuredProduct` = `{product → product, variantKey?}` (orden = orden en la web, solo productos publicados y visibles; un producto solo se repite con versiones distintas) |
| `projectPage` | documento singleton | `lead` (texto editorial, 1 párrafo), `headline`, `body` (texto editorial), `quote?`, `principles[]` {`title`, `text?`} |
| `siteSettings` | documento singleton | `pricingExplanation` (texto editorial con viñetas; sin importes), `contactEmail`, `socialLinks[]` |
| `productVariant` | objeto | `format`, `colour`, `finish` (texto libre, al menos uno), `sku?`, `hasOwnImages` + `images[]`, `hasOwnPricing` + `pricing`, `availability` (`inherit` por defecto) |
| `pricing` | objeto | `minimumPrice` > 0, `recommendedPrice` ≥ mínimo, `supportPrice` ≥ recomendado (EUR, 2 decimales) |
| `galleryImage` | objeto (imagen) | hotspot; `alt` obligatorio cuando hay imagen (una imagen opcional puede quedar vacía) |
| `socialLink` | objeto | `platform`, `url` (https) |

Navegación del Studio: **Tienda** (Productos, Categorías, Etiquetas) · **Web** (Página de inicio, Proyecto) · **Configuración** (Ajustes del sitio). `homePage`, `projectPage` y `siteSettings` son singletons: no se pueden crear, duplicar ni borrar. La herramienta Vision (GROQ) solo aparece en local.

## Edición en el Studio (comportamiento para el editor)

- **Flujo simple:** editar → borrador guardado solo → Publicar → web. Releases y borradores programados están desactivados (`releases.enabled = false`, `scheduledDrafts.enabled = false`). El selector global se llama "Vista de trabajo" (lo que editas, con borradores) / "Web publicada" (override de locale `es-ES`, namespace `studio`).
- **Borrador y Publicar:** todo cambio se guarda solo como borrador. La web (y las referencias, p. ej. para poder borrar un producto quitado de la home) solo cambia al pulsar **Publicar**. Un distintivo "Sin publicar" / "Cambios sin publicar" aparece en la cabecera del documento mientras haya un borrador. No hay auto-publicación.
- **Dirección web (slug):** en productos, categorías y etiquetas se rellena sola desde el nombre (minúsculas, sin acentos, guiones; máx. 96) mientras el documento **no se haya publicado nunca** y el editor no la haya personalizado. Tras publicar ya no cambia al renombrar; sigue siendo editable a mano. Implementado con un input ligero (`schemaTypes/components/AutoSlugInput.tsx`) sobre el campo nativo.
- **Etiquetas:** el selector no ofrece etiquetas ya añadidas; `unique()` sigue como segunda protección.
- **Galerías:** se pueden arrastrar varias imágenes a la vez sobre la galería (nativo) o usar "Seleccionar varias imágenes"; "Añadir otra imagen" añade una sola. La primera es la principal y se reordenan arrastrando. Una imagen sin texto alternativo muestra "Imagen subida · falta el texto alternativo". Los botones vienen de `schemaTypes/components/GalleryArrayInput.tsx`, que solo sustituye la barra de acciones de la lista y sube con el mismo mecanismo que el arrastrar-y-soltar nativo.
- **Estado de cada imagen:** la lista muestra "Imagen lista" / "Falta texto alternativo" (preview de `galleryImage`), y encima de los botones un resumen ("3 imágenes subidas · 1 sin texto alternativo. Los cambios se guardan automáticamente como borrador."). El editor nativo de la imagen se mantiene; encima del texto alternativo, un aviso verde (`ImageSavedNotice`, solo con imagen subida) dice "Imagen guardada automáticamente · cierra esta ventana con la X · no necesitas pulsar «Publicar» para guardar la imagen", y debajo va la ayuda del texto alternativo en estilo discreto. Sin botón Guardar extra.
- **Código interno** (`sku`): opcional, en producto y versión; no se muestra en la web.

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

**Texto editorial** (`introText`, `projectPage.lead`/`body`, `pricingExplanation`): Portable Text restringido. Solo párrafos normales (y viñetas en `pricingExplanation`) y una marca semántica, **Destacado**, guardada como `em`; la web la pinta con el color de acento (como el `<em>` actual de la intro y de "Somos *Encrudo*"). Sin colores, tamaños, enlaces ni bloques de maquetación: tipografía, colores y layout siguen en el frontend. Los saltos de línea suaves (Mayús+Intro) llegan como `\n` dentro del texto. Las imágenes de Proyecto (cabecera, retrato, paisaje) siguen en el frontend.

Textos de la web:
```groq
*[_id == "homePage"][0]{introHeading, introText, introLinkLabel}
*[_id == "projectPage"][0]{lead, headline, body, quote, principles[]{title, text}}
*[_id == "siteSettings"][0]{pricingExplanation}
```
`pricingExplanation` es texto común; los importes (mínimo, recomendado, apoyo) salen siempre del producto o la versión, y Stripe validará el mínimo en servidor. Nota: el frontend actual etiqueta el recomendado como "Sugerido".

**Destacados de la home** (`homePage.featuredProducts[]`, tipo `featuredProduct`):

- `product`: referencia al producto (obligatoria). El producto sigue siendo la entidad principal; las versiones siguen embebidas en él.
- `variantKey` (opcional): el `_key` del elemento de `product.variants[]` que se quiere destacar. Nunca la posición ni la etiqueta. El selector del Studio solo lista las versiones **publicadas** del producto elegido; si se cambia de producto y la versión no existe en el nuevo, se vacía. Si una versión destacada se borra después del producto, la validación lo marca ("La versión seleccionada ya no existe en este producto…").
- **Sin versión:** la tarjeta usa los valores del producto: imagen `cardImage` → `images[0]`, `pricing`, `availability`.
- **Con versión:** usa los valores efectivos de esa versión: imagen = `images[0]` de la versión si `hasOwnImages`, si no `cardImage` → `images[0]` del producto; precio = `pricing` de la versión si `hasOwnPricing`, si no el del producto; disponibilidad = la de la versión salvo `inherit`, si no la del producto. Si `variantKey` ya no existe, la web cae al producto principal.
- **Enlace:** siempre a la ficha del producto (`slug`). La integración del frontend debe conservar `variantKey` en el enlace para poder preseleccionar esa versión en la ficha; el formato (query string, estado, etc.) lo decidirá el frontend, Sanity no lo fija.

```groq
*[_id == "homePage"][0].featuredProducts[product->visible != false]{
  _key, variantKey,
  "product": product->{_id, title, "slug": slug.current, shortDescription},
  "variant": product->variants[_key == ^.variantKey][0]{
    _key, format, colour, finish,
    "label": array::join(array::compact([format, colour, finish]), " · ")
  },
  "image": coalesce(
    product->variants[_key == ^.variantKey && hasOwnImages == true][0].images[0],
    product->cardImage, product->images[0]),
  "pricing": coalesce(
    product->variants[_key == ^.variantKey && hasOwnPricing == true][0].pricing,
    product->pricing),
  "availability": coalesce(
    product->variants[_key == ^.variantKey && availability != "inherit"][0].availability,
    product->availability)
}
```

**Cambio de forma de `featuredProducts`:** antes era un array de referencias (`{_type: "reference", _ref}`), ahora es un array de `featuredProduct`. `production` no tiene contenido. Si `development` tiene una Página de inicio con destacados del formato anterior, el Studio los marca como error; para convertirlos (conserva `_key`, orden y producto, sin versión):

```bash
npx sanity login   # tu propia sesión, sin tokens compartidos
npx sanity migration run featured-products-items --dataset development              # simulación
npx sanity migration run featured-products-items --dataset development --no-dry-run # aplica
```

También vale quitar esos elementos y volver a añadir los productos a mano.
