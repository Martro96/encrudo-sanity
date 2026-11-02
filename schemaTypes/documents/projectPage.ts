import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineArrayMember, defineField, defineType} from 'sanity'
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
    defineField({
      name: 'principles',
      title: 'Principios',
      description: 'Lista de ideas que definen Encrudo, en el orden en que aparecen. Arrastra para reordenarlas.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'principle',
          title: 'Principio',
          fields: [
            defineField({
              name: 'title',
              title: 'Primera frase',
              description: 'Ej.: "Creamos a mano, con oficio y tiempo."',
              type: 'string',
              validation: (rule) => [rule.required().error('Escribe la primera frase'), trimmedString(rule)],
            }),
            defineField({
              name: 'text',
              title: 'Continuación',
              description: 'Opcional. Ej.: "Cada pieza es única."',
              type: 'text',
              rows: 2,
              validation: (rule) => trimmedString(rule),
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'text'}},
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Proyecto'})},
})
