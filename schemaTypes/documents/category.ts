import {TagsIcon} from '@sanity/icons/Tags'
import {defineField, defineType} from 'sanity'
import {trimmedString} from '../lib/validation'

export const category = defineType({
  name: 'category',
  title: 'Categoría',
  type: 'document',
  icon: TagsIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      description: 'Nombre de la categoría tal como aparece en la web. Ej.: Fanzines, Láminas.',
      type: 'string',
      validation: (rule) => [rule.required().error('Escribe el nombre de la categoría'), rule.max(60), trimmedString(rule)],
    }),
    defineField({
      name: 'slug',
      title: 'Dirección web (slug)',
      description: 'Pulsa "Generar" para crearla a partir del nombre. Evita cambiarla después de publicar.',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required().error('Genera la dirección web a partir del nombre'),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      description: 'Opcional. Texto breve sobre la categoría. Máximo 300 caracteres.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300).error('Máximo 300 caracteres'),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})
