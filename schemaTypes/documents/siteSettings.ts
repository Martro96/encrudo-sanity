import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Ajustes del sitio',
  type: 'document',
  fields: [
    defineField({
      name: 'contactEmail',
      title: 'Email de contacto',
      type: 'string',
      validation: (rule) => rule.required().email().error('Introduce un email válido'),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Redes sociales',
      type: 'array',
      of: [defineArrayMember({type: 'socialLink'})],
    }),
  ],
  preview: {prepare: () => ({title: 'Ajustes del sitio'})},
})
