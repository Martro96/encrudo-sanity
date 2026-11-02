import {TagIcon} from '@sanity/icons/Tag'
import {defineField, defineType} from 'sanity'
import {trimmedString} from '../lib/validation'

export const tag = defineType({
  name: 'tag',
  title: 'Etiqueta',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      description: 'Ej.: Edición limitada, Risografía, Novedad.',
      type: 'string',
      validation: (rule) => [rule.required().error('Escribe el nombre de la etiqueta'), rule.max(40), trimmedString(rule)],
    }),
    defineField({
      name: 'slug',
      title: 'Dirección web (slug)',
      description: 'Pulsa "Generar" para crearla a partir del nombre.',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required().error('Genera la dirección web a partir del nombre'),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})
