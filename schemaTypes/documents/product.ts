import {PackageIcon} from '@sanity/icons/Package'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {AutoSlugInput} from '../components/AutoSlugInput'
import {GalleryArrayInput} from '../components/GalleryArrayInput'
import {formatEuros} from '../lib/format'
import {SLUG_MAX_LENGTH, slugFormat, slugify} from '../lib/slug'
import {trimmedString} from '../lib/validation'
import {validateGallery} from '../objects/galleryImage'
import {AVAILABILITY, INHERIT} from '../objects/productVariant'

const ATTRIBUTES = ['format', 'colour', 'finish'] as const
type VariantValue = {format?: string; colour?: string; finish?: string; availability?: string}

const attributeKey = (v: VariantValue) => ATTRIBUTES.map((a) => v[a]?.trim().toLowerCase() ?? '').join('|')
const attributeLabel = (v: VariantValue) => ATTRIBUTES.map((a) => v[a]).filter(Boolean).join(' · ')

export const product = defineType({
  name: 'product',
  title: 'Producto',
  type: 'document',
  icon: PackageIcon,
  groups: [
    {name: 'info', title: 'Información del producto', default: true},
    {name: 'images', title: 'Imágenes'},
    {name: 'sale', title: 'Venta y disponibilidad'},
    {name: 'variants', title: 'Versiones del producto'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      description: 'Nombre del producto tal como aparece en la web.',
      type: 'string',
      group: 'info',
      validation: (rule) => [rule.required().error('Escribe el nombre del producto'), rule.max(100), trimmedString(rule)],
    }),
    defineField({
      name: 'slug',
      title: 'Dirección web',
      description:
        'Se crea sola a partir del nombre mientras el producto no se haya publicado (ej.: blanco-y-negro). Una vez publicado ya no cambia aunque cambies el nombre, para no romper enlaces; si de verdad necesitas cambiarla, edítala aquí.',
      type: 'slug',
      group: 'info',
      options: {source: 'title', maxLength: SLUG_MAX_LENGTH, slugify},
      components: {input: AutoSlugInput},
      validation: (rule) => [rule.required().error('Escribe el nombre para crear la dirección web'), slugFormat(rule)],
    }),
    defineField({
      name: 'visible',
      title: 'Visible en el catálogo',
      description:
        'Desactívalo para ocultar temporalmente el producto de la web sin borrarlo. Al volver a activarlo (y publicar), reaparece.',
      type: 'boolean',
      group: 'info',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      description: 'La categoría principal del producto. Solo una.',
      type: 'reference',
      to: [{type: 'category'}],
      group: 'info',
      validation: (rule) => rule.required().error('Elige una categoría'),
    }),
    defineField({
      name: 'tags',
      title: 'Etiquetas',
      description:
        'Opcional. Etiquetas para ayudar a encontrar y filtrar productos (ej.: Novedad, Edición limitada). No repitas aquí el formato, color o acabado: eso se indica en las versiones.',
      type: 'array',
      group: 'info',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tag'}],
          options: {
            filter: ({document}) => ({
              filter: '!(_id in $selected)',
              params: {
                selected: ((document?.tags as Array<{_ref?: string}> | undefined) ?? [])
                  .map((ref) => ref._ref)
                  .filter(Boolean),
              },
            }),
          },
        }),
      ],
      validation: (rule) => rule.unique().error('Esta etiqueta ya está añadida'),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Descripción corta',
      description: 'Una o dos frases que se muestran en las tarjetas del catálogo. Máximo 200 caracteres.',
      type: 'text',
      rows: 2,
      group: 'info',
      validation: (rule) => [rule.max(200).error('Máximo 200 caracteres'), trimmedString(rule)],
    }),
    defineField({
      name: 'description',
      title: 'Descripción completa',
      description: 'Texto completo que aparece en la ficha del producto.',
      type: 'array',
      group: 'info',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [
            {title: 'Viñetas', value: 'bullet'},
            {title: 'Numerada', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Negrita', value: 'strong'},
              {title: 'Cursiva', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                title: 'Enlace',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'Dirección del enlace',
                    type: 'url',
                    validation: (rule) =>
                      rule.required().uri({scheme: ['http', 'https', 'mailto']}),
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'cardImage',
      title: 'Imagen principal para catálogo',
      description:
        'Opcional. Representa al producto en el catálogo y en los destacados de la página de inicio. Si la dejas vacía, se usa la primera foto de la galería principal.',
      type: 'galleryImage',
      group: 'images',
    }),
    defineField({
      name: 'images',
      title: 'Galería principal',
      description:
        'Fotos del producto que se muestran en su ficha. Sube o arrastra varias imágenes a la vez (también con "Seleccionar varias imágenes") y después añade el texto alternativo de cada una. La primera será la principal; arrástralas para cambiar el orden. Si una versión usa fotos diferentes, se añaden dentro de esa versión.',
      type: 'array',
      group: 'images',
      of: [defineArrayMember({type: 'galleryImage'})],
      options: {layout: 'grid'},
      components: {input: GalleryArrayInput},
      validation: (rule) => rule.custom((images) => validateGallery(images, 'Añade al menos una foto a la galería principal')),
    }),
    defineField({
      name: 'pricing',
      title: 'Precios',
      description:
        'Precios del producto. Si tiene versiones, son los precios de todas ellas salvo las que tengan "precios diferentes".',
      type: 'pricing',
      group: 'sale',
      validation: (rule) => rule.required().error('Indica los precios del producto'),
    }),
    defineField({
      name: 'availability',
      title: 'Disponibilidad',
      description:
        'Si está agotado o próximamente, se muestra en la web pero no se puede comprar. Si tiene versiones, cada una puede indicar la suya.',
      type: 'string',
      group: 'sale',
      options: {list: AVAILABILITY, layout: 'radio', direction: 'horizontal'},
      initialValue: 'available',
      validation: (rule) => rule.required().error('Elige la disponibilidad'),
    }),
    defineField({
      name: 'sku',
      title: 'Código interno',
      description:
        'Opcional. Si usas un código propio para identificar este producto en inventario o pedidos, escríbelo aquí. Si no utilizas códigos, déjalo vacío. No se muestra en la web.',
      type: 'string',
      group: 'sale',
      validation: (rule) => [rule.max(64), trimmedString(rule)],
    }),
    defineField({
      name: 'variants',
      title: 'Versiones del producto',
      description:
        'Utiliza esta sección únicamente si este producto existe en distintas versiones, por ejemplo por formato, color o acabado. Si añades versiones, el cliente elige una de ellas al comprar; cada versión usa las fotos, precios y disponibilidad del producto salvo que indiques otros. La primera de la lista es la seleccionada por defecto; arrastra para cambiar el orden.',
      type: 'array',
      group: 'variants',
      of: [defineArrayMember({type: 'productVariant'})],
      validation: (rule) => [
        rule.custom((variants) => {
          if (!Array.isArray(variants)) return true
          const seen = new Set<string>()
          for (const v of variants as VariantValue[]) {
            const key = attributeKey(v)
            if (key === '||') continue
            if (seen.has(key)) {
              return `Hay dos versiones iguales (${attributeLabel(v)}). Cambia el formato, el color o el acabado de una de ellas.`
            }
            seen.add(key)
          }
          return true
        }),
        rule.custom((variants) => {
          if (!Array.isArray(variants) || variants.length < 2) return true
          const shapes = new Set(
            (variants as VariantValue[]).map((v) => ATTRIBUTES.filter((a) => v[a]?.trim()).join('+')),
          )
          return shapes.size === 1
            ? true
            : {
                message:
                  'Las versiones no indican los mismos datos (unas tienen formato, otras color…). Revisa que el cliente pueda distinguirlas.',
                level: 'warning',
              }
        }),
        rule.custom((variants, context) => {
          if (!Array.isArray(variants) || variants.length === 0) return true
          const base = (context.document as {availability?: string} | undefined)?.availability
          const anyAvailable = (variants as VariantValue[]).some(
            (v) => (!v.availability || v.availability === INHERIT ? base : v.availability) === 'available',
          )
          return anyAvailable
            ? true
            : {message: 'Ninguna versión está disponible: el producto no se podrá comprar.', level: 'info'}
        }),
      ],
    }),
  ],
  orderings: [
    {title: 'Nombre (A-Z)', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
    {title: 'Última modificación', name: 'updatedDesc', by: [{field: '_updatedAt', direction: 'desc'}]},
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      visible: 'visible',
      cardImage: 'cardImage',
      firstImage: 'images.0',
      variants: 'variants',
      minimumPrice: 'pricing.minimumPrice',
    },
    prepare: ({title, category, visible, cardImage, firstImage, variants, minimumPrice}) => {
      const count = Array.isArray(variants) ? variants.length : 0
      return {
        title: title || 'Producto sin nombre',
        subtitle: [
          visible === false ? 'OCULTO' : null,
          category,
          formatEuros(minimumPrice) && `desde ${formatEuros(minimumPrice)}`,
          count ? `${count} ${count === 1 ? 'versión' : 'versiones'}` : null,
        ]
          .filter(Boolean)
          .join(' · '),
        media: cardImage?.asset ? cardImage : firstImage,
      }
    },
  },
})
