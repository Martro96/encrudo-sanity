import {PackageIcon} from '@sanity/icons/Package'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {trimmedString} from '../lib/validation'

type VariantValue = {format?: string; colour?: string; finish?: string; availability?: string}

export const product = defineType({
  name: 'product',
  title: 'Producto',
  type: 'document',
  icon: PackageIcon,
  groups: [
    {name: 'info', title: 'Información', default: true},
    {name: 'texts', title: 'Textos'},
    {name: 'card', title: 'Imagen de tarjeta'},
    {name: 'variants', title: 'Variantes y precios'},
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
      title: 'Dirección web (slug)',
      description:
        'Última parte de la dirección del producto en la web (ej.: blanco-y-negro). Pulsa "Generar" para crearla a partir del nombre. Evita cambiarla después de publicar, porque los enlaces antiguos dejarían de funcionar.',
      type: 'slug',
      group: 'info',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required().error('Genera la dirección web a partir del nombre'),
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
      description: 'Opcional. Etiquetas para ayudar a encontrar y filtrar productos. Puedes añadir varias.',
      type: 'array',
      group: 'info',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tag'}]})],
      validation: (rule) => rule.unique().error('Esta etiqueta ya está añadida'),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Descripción corta',
      description: 'Una o dos frases que se muestran en las tarjetas del catálogo. Máximo 200 caracteres.',
      type: 'text',
      rows: 2,
      group: 'texts',
      validation: (rule) => [rule.max(200).error('Máximo 200 caracteres'), trimmedString(rule)],
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      description: 'Texto completo que aparece en la ficha del producto.',
      type: 'array',
      group: 'texts',
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
      title: 'Imagen de tarjeta',
      description:
        'Opcional. Es la imagen que representa al producto en el catálogo y en los destacados de la página de inicio. Si la dejas vacía, se usará la primera foto de la primera variante. Las fotos de cada variante se añaden en "Variantes y precios".',
      type: 'galleryImage',
      group: 'card',
    }),
    defineField({
      name: 'variants',
      title: 'Variantes',
      description:
        'Cada variante (formato, color, acabado…) tiene su propia galería de fotos, precios y disponibilidad. Si el producto solo tiene una versión, crea una única variante. La primera de la lista es la que se muestra por defecto en la web; arrastra para cambiar el orden.',
      type: 'array',
      group: 'variants',
      of: [defineArrayMember({type: 'productVariant'})],
      validation: (rule) => [
        rule.required().min(1).error('Añade al menos una variante'),
        rule.custom((variants) => {
          if (!Array.isArray(variants)) return true
          const seen = new Set<string>()
          for (const v of variants as VariantValue[]) {
            const key = [v.format, v.colour, v.finish].map((s) => s?.trim().toLowerCase() ?? '').join('|')
            if (key === '||') continue
            if (seen.has(key)) {
              const label = [v.format, v.colour, v.finish].filter(Boolean).join(' · ')
              return `Hay dos variantes iguales (${label}). Cambia el formato, el color o el acabado de una de ellas.`
            }
            seen.add(key)
          }
          return true
        }),
        rule.custom((variants) => {
          if (!Array.isArray(variants) || variants.length === 0) return true
          return (variants as VariantValue[]).some((v) => v.availability === 'available')
            ? true
            : {message: 'Ninguna variante está disponible: el producto no se podrá comprar.', level: 'info'}
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
      firstVariantImage: 'variants.0.images.0',
      variants: 'variants',
    },
    prepare: ({title, category, visible, cardImage, firstVariantImage, variants}) => {
      const count = Array.isArray(variants) ? variants.length : 0
      return {
        title: title || 'Producto sin nombre',
        subtitle: [
          visible === false ? 'OCULTO' : null,
          category,
          count ? `${count} ${count === 1 ? 'variante' : 'variantes'}` : 'Sin variantes',
        ]
          .filter(Boolean)
          .join(' · '),
        media: cardImage?.asset ? cardImage : firstVariantImage,
      }
    },
  },
})
