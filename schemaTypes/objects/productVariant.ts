import {defineField, defineType} from 'sanity'
import {trimmedString} from '../lib/validation'

const AVAILABILITY = [
  {title: 'Disponible', value: 'available'},
  {title: 'Agotado', value: 'soldOut'},
  {title: 'Próximamente', value: 'comingSoon'},
]

const attributeField = (name: string, title: string, example: string) =>
  defineField({
    name,
    title,
    type: 'string',
    description: `Opcional. Texto libre, ej.: ${example}. Escríbelo siempre igual en todas las variantes (mismas mayúsculas y acentos) para que el selector de la web las agrupe bien.`,
    validation: (rule) => [rule.max(40), trimmedString(rule)],
  })

export const productVariant = defineType({
  name: 'productVariant',
  title: 'Variante',
  type: 'object',
  fieldsets: [{name: 'attributes', title: 'Atributos', options: {columns: 3}}],
  fields: [
    {...attributeField('format', 'Formato', '"A5", "A4", "Póster 50×70"'), fieldset: 'attributes'},
    {...attributeField('colour', 'Color', '"Negro", "Rojo"'), fieldset: 'attributes'},
    {...attributeField('finish', 'Acabado', '"Mate", "Brillo", "Risografía"'), fieldset: 'attributes'},
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Opcional. Código interno de referencia.',
      validation: (rule) => [rule.max(64), trimmedString(rule)],
    }),
    defineField({
      name: 'images',
      title: 'Galería de la variante',
      description:
        'Imágenes propias de esta variante. Se muestran en la ficha cuando el visitante la selecciona. La primera es la principal.',
      type: 'array',
      of: [{type: 'galleryImage'}],
      options: {layout: 'grid'},
      validation: (rule) => rule.required().min(1).error('Añade al menos una imagen'),
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
      type: 'string',
      options: {list: AVAILABILITY, layout: 'radio', direction: 'horizontal'},
      initialValue: 'available',
      validation: (rule) => rule.required(),
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
      price: 'pricing.recommendedPrice',
      availability: 'availability',
    },
    prepare: ({format, colour, finish, media, price, availability}) => ({
      title: [format, colour, finish].filter(Boolean).join(' · ') || 'Variante sin atributos',
      subtitle: [
        typeof price === 'number' ? `${price.toFixed(2)} €` : null,
        AVAILABILITY.find((a) => a.value === availability)?.title,
      ]
        .filter(Boolean)
        .join(' — '),
      media,
    }),
  },
})
