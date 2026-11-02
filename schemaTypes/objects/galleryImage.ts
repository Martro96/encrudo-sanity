import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'
import {trimmedString} from '../lib/validation'

export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Imagen',
  type: 'image',
  icon: ImageIcon,
  description:
    'Puedes elegir el punto de interés (hotspot) para que el recorte no corte lo importante. Si subes la misma imagen varias veces, Sanity la guarda solo una vez.',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Texto alternativo',
      description:
        'Describe brevemente lo que se ve. Lo leen las personas que usan lectores de pantalla y los buscadores. Ej.: "Fanzine Blanco y Negro A5, portada en tinta roja".',
      type: 'string',
      validation: (rule) => [
        rule.required().error('Escribe un texto alternativo para la imagen'),
        rule.max(160),
        trimmedString(rule),
      ],
    }),
  ],
  validation: (rule) => rule.required().assetRequired().error('Sube una imagen'),
})
