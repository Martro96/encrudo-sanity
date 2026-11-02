import {TagsIcon} from '@sanity/icons/Tags'
import {defineField, defineType} from 'sanity'
import {AutoSlugInput} from '../components/AutoSlugInput'
import {SLUG_MAX_LENGTH, slugFormat, slugify} from '../lib/slug'
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
      title: 'Dirección web',
      description: 'Se crea sola a partir del nombre mientras no se haya publicado. Después ya no cambia, para no romper enlaces; puedes editarla si lo necesitas.',
      type: 'slug',
      options: {source: 'title', maxLength: SLUG_MAX_LENGTH, slugify},
      components: {input: AutoSlugInput},
      validation: (rule) => [rule.required().error('Escribe el nombre para crear la dirección web'), slugFormat(rule)],
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
