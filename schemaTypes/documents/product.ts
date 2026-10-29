import {defineArrayMember, defineField, defineType} from 'sanity'
import {trimmedString} from '../lib/validation'

export const product = defineType({
  name: 'product',
  title: 'Producto',
  type: 'document',
  groups: [
    {name: 'content', title: 'Contenido', default: true},
    {name: 'variants', title: 'Variantes'},
    {name: 'classification', title: 'Clasificación'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      type: 'string',
      group: 'content',
      validation: (rule) => [rule.required(), rule.max(100), trimmedString(rule)],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'Se usa en la URL del producto. Genéralo a partir del nombre.',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'visible',
      title: 'Visible en el catálogo',
      description:
        'Desactívalo para ocultar temporalmente el producto de la web sin despublicarlo ni borrarlo.',
      type: 'boolean',
      group: 'content',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cardImage',
      title: 'Imagen de tarjeta',
      description:
        'Opcional. Imagen para el catálogo y los bloques de producto de la home. Si se deja vacía, se usará la primera imagen de la primera variante.',
      type: 'galleryImage',
      group: 'content',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Descripción corta',
      description: 'Una o dos frases para las tarjetas del catálogo.',
      type: 'text',
      rows: 2,
      group: 'content',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'array',
      group: 'content',
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
                    title: 'URL',
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
      name: 'variants',
      title: 'Variantes',
      description:
        'Cada variante (formato, color, acabado…) tiene su propia galería, precios y disponibilidad. La primera de la lista es la variante por defecto; arrastra para reordenar.',
      type: 'array',
      group: 'variants',
      of: [defineArrayMember({type: 'productVariant'})],
      validation: (rule) => [
        rule.required().min(1).error('Añade al menos una variante'),
        rule.custom((variants) => {
          if (!Array.isArray(variants)) return true
          const seen = new Set<string>()
          for (const v of variants as {format?: string; colour?: string; finish?: string}[]) {
            const key = [v.format, v.colour, v.finish].map((s) => s?.trim().toLowerCase() ?? '').join('|')
            if (key === '||') continue
            if (seen.has(key)) return 'Hay dos variantes con el mismo formato, color y acabado'
            seen.add(key)
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'category',
      title: 'Categoría principal',
      type: 'reference',
      to: [{type: 'category'}],
      group: 'classification',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Etiquetas',
      description: 'Clasificación adicional para filtrar y descubrir productos.',
      type: 'array',
      group: 'classification',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tag'}]})],
      validation: (rule) => rule.unique().error('No repitas etiquetas'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      visible: 'visible',
      cardImage: 'cardImage',
      firstVariantImage: 'variants.0.images.0',
    },
    prepare: ({title, category, visible, cardImage, firstVariantImage}) => ({
      title,
      subtitle: [category, visible === false ? 'Oculto' : null].filter(Boolean).join(' — '),
      media: cardImage?.asset ? cardImage : firstVariantImage,
    }),
  },
})
