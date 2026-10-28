import {defineField, defineType} from 'sanity'
import {trimmedString} from '../lib/validation'

export const category = defineType({
  name: 'category',
  title: 'Categoría',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => [rule.required(), rule.max(60), trimmedString(rule)],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'Se usa en la URL. Genéralo a partir del nombre.',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})
