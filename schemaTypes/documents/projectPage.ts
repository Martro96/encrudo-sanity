import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'
import {EDITORIAL_HELP, editorialBlock} from '../lib/editorialText'
import {trimmedString} from '../lib/validation'

export const projectPage = defineType({
  name: 'projectPage',
  title: 'Proyecto',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'lead',
      title: 'Frase de entrada',
      description: `Primera frase pequeña de la página (ej.: "Somos Encrudo, un proyecto personal y artesanal."). ${EDITORIAL_HELP}`,
      type: 'array',
      of: [editorialBlock()],
      validation: (rule) => rule.required().max(1).error('Escribe una sola frase de entrada'),
    }),
    defineField({
      name: 'headline',
      title: 'Titular',
      description: 'Frase grande que resume lo que ofrece Encrudo.',
      type: 'text',
      rows: 2,
      validation: (rule) => [rule.required().error('Escribe el titular'), rule.max(200), trimmedString(rule)],
    }),
    defineField({
      name: 'body',
      title: 'Texto',
      description: `Párrafos que siguen al titular. ${EDITORIAL_HELP}`,
      type: 'array',
      of: [editorialBlock()],
      validation: (rule) => rule.required().error('Escribe al menos un párrafo'),
    }),
    defineField({
      name: 'quote',
      title: 'Cita',
      description: 'Frase destacada en grande, sin comillas (la web las añade).',
      type: 'string',
      validation: (rule) => [rule.max(140), trimmedString(rule)],
    }),
  ],
  preview: {prepare: () => ({title: 'Proyecto'})},
})
