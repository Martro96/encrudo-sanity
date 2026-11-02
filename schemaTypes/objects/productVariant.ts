import {ComponentIcon} from '@sanity/icons/Component'
import {defineField, defineType} from 'sanity'
import {GalleryArrayInput} from '../components/GalleryArrayInput'
import {formatEuros} from '../lib/format'
import {trimmedString} from '../lib/validation'
import {validateGallery} from './galleryImage'

export const AVAILABILITY = [
  {title: 'Disponible', value: 'available'},
  {title: 'Agotado', value: 'soldOut'},
  {title: 'Próximamente', value: 'comingSoon'},
]

/** Variant availability value meaning "use the product's availability". */
export const INHERIT = 'inherit'

type VariantParent = {hasOwnImages?: boolean; hasOwnPricing?: boolean}

const attributeField = (name: string, title: string, example: string) =>
  defineField({
    name,
    title,
    type: 'string',
    fieldset: 'attributes',
    description: `Ej.: ${example}`,
    validation: (rule) => [rule.max(40), trimmedString(rule)],
  })

export const productVariant = defineType({
  name: 'productVariant',
  title: 'Versión',
  type: 'object',
  icon: ComponentIcon,
  fieldsets: [
    {
      name: 'attributes',
      title: 'Qué es esta versión',
      description:
        'Escribe todo lo que identifica a esta versión, tal como lo elegirá el cliente (ej.: A4 · Rojo · Mate). Basta con uno si es suficiente para distinguirla (ej.: solo "Rojo"). Escríbelo siempre igual en todas las versiones (mismas mayúsculas y acentos).',
      options: {columns: 3},
    },
  ],
  fields: [
    attributeField('format', 'Formato', 'A5, A4, Póster 50×70'),
    attributeField('colour', 'Color', 'Negro, Rojo'),
    attributeField('finish', 'Acabado', 'Mate, Brillo, Risografía'),
    defineField({
      name: 'hasOwnImages',
      title: 'Esta versión usa fotos diferentes',
      description: 'Desactivado: se muestran las fotos de la galería principal del producto.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'images',
      title: 'Fotos de esta versión',
      description:
        'Se muestran en la ficha del producto cuando el cliente elige esta versión, en lugar de la galería principal. Sube o arrastra varias imágenes a la vez (también con "Seleccionar varias imágenes") y después añade el texto alternativo de cada una. La primera será la principal; arrástralas para cambiar el orden.',
      type: 'array',
      of: [{type: 'galleryImage'}],
      options: {layout: 'grid'},
      components: {input: GalleryArrayInput},
      hidden: ({parent}) => !(parent as VariantParent | undefined)?.hasOwnImages,
      validation: (rule) =>
        rule.custom((images, context) =>
          (context.parent as VariantParent | undefined)?.hasOwnImages
            ? validateGallery(images, 'Añade al menos una foto de esta versión, o desactiva "usa fotos diferentes"')
            : true,
        ),
    }),
    defineField({
      name: 'hasOwnPricing',
      title: 'Esta versión tiene precios diferentes',
      description: 'Desactivado: se usan los precios del producto.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'pricing',
      title: 'Precios de esta versión',
      type: 'pricing',
      hidden: ({parent}) => !(parent as VariantParent | undefined)?.hasOwnPricing,
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as VariantParent | undefined)?.hasOwnPricing && !value
            ? 'Indica los precios de esta versión, o desactiva "tiene precios diferentes"'
            : true,
        ),
    }),
    defineField({
      name: 'availability',
      title: 'Disponibilidad',
      description: 'Normalmente igual que el producto. Cámbiala solo si esta versión en concreto está agotada o llega más tarde.',
      type: 'string',
      options: {
        list: [{title: 'Igual que el producto', value: INHERIT}, ...AVAILABILITY],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: INHERIT,
    }),
    defineField({
      name: 'sku',
      title: 'Código interno de esta versión',
      description:
        'Opcional. Si usas un código propio para esta versión en inventario o pedidos, escríbelo aquí. Si no, déjalo vacío. No se muestra en la web.',
      type: 'string',
      validation: (rule) => [rule.max(64), trimmedString(rule)],
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      const v = value as {format?: string; colour?: string; finish?: string} | undefined
      if (!v) return true
      return v.format || v.colour || v.finish
        ? true
        : 'Indica qué es esta versión: formato, color o acabado (al menos uno)'
    }),
  preview: {
    select: {
      format: 'format',
      colour: 'colour',
      finish: 'finish',
      hasOwnImages: 'hasOwnImages',
      hasOwnPricing: 'hasOwnPricing',
      media: 'images.0',
      minimumPrice: 'pricing.minimumPrice',
      availability: 'availability',
    },
    prepare: ({format, colour, finish, hasOwnImages, hasOwnPricing, media, minimumPrice, availability}) => {
      const ownAvailability = AVAILABILITY.find((a) => a.value === availability)?.title
      return {
        title: [format, colour, finish].filter(Boolean).join(' · ') || 'Versión sin nombre',
        subtitle: [
          hasOwnImages ? 'fotos propias' : 'fotos del producto',
          hasOwnPricing && formatEuros(minimumPrice)
            ? `precios propios (mín. ${formatEuros(minimumPrice)})`
            : 'precios del producto',
          ownAvailability ?? 'disponibilidad del producto',
        ].join(' · '),
        media: hasOwnImages ? media : undefined,
      }
    },
  },
})
