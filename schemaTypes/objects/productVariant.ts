import {ComponentIcon} from '@sanity/icons/Component'
import {defineField, defineType} from 'sanity'
import {formatEuros} from '../lib/format'
import {trimmedString} from '../lib/validation'

export const AVAILABILITY = [
  {title: 'Disponible', value: 'available'},
  {title: 'Agotado', value: 'soldOut'},
  {title: 'Próximamente', value: 'comingSoon'},
]

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
  title: 'Variante',
  type: 'object',
  icon: ComponentIcon,
  fieldsets: [
    {
      name: 'attributes',
      title: 'Qué distingue a esta variante',
      description:
        'Rellena al menos uno. Es lo que verá el cliente al elegir la variante, así que escríbelo siempre igual en todas (mismas mayúsculas y acentos).',
      options: {columns: 3},
    },
    {
      name: 'internal',
      title: 'Datos internos (opcional)',
      options: {collapsible: true, collapsed: true},
    },
  ],
  fields: [
    attributeField('format', 'Formato', 'A5, A4, Póster 50×70'),
    attributeField('colour', 'Color', 'Negro, Rojo'),
    attributeField('finish', 'Acabado', 'Mate, Brillo, Risografía'),
    defineField({
      name: 'images',
      title: 'Galería de esta variante',
      description:
        'Fotos que se ven en la ficha del producto cuando el cliente elige esta variante. La primera es la principal; arrastra para reordenar. (La imagen del catálogo se elige aparte, en "Imagen de tarjeta".)',
      type: 'array',
      of: [{type: 'galleryImage'}],
      options: {layout: 'grid'},
      validation: (rule) => rule.required().min(1).error('Añade al menos una foto a la galería de esta variante'),
    }),
    defineField({
      name: 'pricing',
      title: 'Precios',
      type: 'pricing',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'availability',
      title: 'Disponibilidad',
      description: 'Si está agotada o próximamente, se mostrará en la web pero no se podrá comprar.',
      type: 'string',
      options: {list: AVAILABILITY, layout: 'radio', direction: 'horizontal'},
      initialValue: 'available',
      validation: (rule) => rule.required().error('Elige la disponibilidad'),
    }),
    defineField({
      name: 'sku',
      title: 'Referencia interna (SKU)',
      description: 'Opcional. Un código para identificar la variante en inventario. No se muestra en la web.',
      type: 'string',
      fieldset: 'internal',
      validation: (rule) => [rule.max(64), trimmedString(rule)],
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      const v = value as {format?: string; colour?: string; finish?: string} | undefined
      if (!v) return true
      return v.format || v.colour || v.finish
        ? true
        : 'Indica al menos un atributo: formato, color o acabado'
    }),
  preview: {
    select: {
      format: 'format',
      colour: 'colour',
      finish: 'finish',
      media: 'images.0',
      minimumPrice: 'pricing.minimumPrice',
      recommendedPrice: 'pricing.recommendedPrice',
      availability: 'availability',
    },
    prepare: ({format, colour, finish, media, minimumPrice, recommendedPrice, availability}) => {
      const prices = [
        formatEuros(minimumPrice) && `mín. ${formatEuros(minimumPrice)}`,
        formatEuros(recommendedPrice) && `rec. ${formatEuros(recommendedPrice)}`,
      ]
        .filter(Boolean)
        .join(' · ')
      return {
        title: [format, colour, finish].filter(Boolean).join(' · ') || 'Variante sin atributos',
        subtitle: [AVAILABILITY.find((a) => a.value === availability)?.title, prices]
          .filter(Boolean)
          .join(' — '),
        media,
      }
    },
  },
})
