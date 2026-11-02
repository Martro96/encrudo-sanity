import {TagIcon} from '@sanity/icons/Tag'
import {defineField, defineType} from 'sanity'
import {AutoSlugInput} from '../components/AutoSlugInput'
import {SLUG_MAX_LENGTH, slugFormat, slugify} from '../lib/slug'
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
      title: 'Dirección web',
      description: 'Se crea sola a partir del nombre mientras no se haya publicado. Después ya no cambia, para no romper enlaces; puedes editarla si lo necesitas.',
      type: 'slug',
      options: {source: 'title', maxLength: SLUG_MAX_LENGTH, slugify},
      components: {input: AutoSlugInput},
      validation: (rule) => [rule.required().error('Escribe el nombre para crear la dirección web'), slugFormat(rule)],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})
