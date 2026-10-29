import {defineField, defineType} from 'sanity'
import {trimmedString} from '../lib/validation'

export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Imagen',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Texto alternativo',
      description: 'Describe la imagen para lectores de pantalla y SEO. Ej.: "Fanzine Blanco y Negro A5, portada en tinta roja".',
      type: 'string',
      validation: (rule) => [rule.required().error('El texto alternativo es obligatorio'), trimmedString(rule)],
    }),
  ],
  validation: (rule) => rule.required().assetRequired(),
})
