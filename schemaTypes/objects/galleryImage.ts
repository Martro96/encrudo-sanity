import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'
import {isInactiveVariantOverride, trimmedString} from '../lib/validation'

type ImageValue = {asset?: unknown}

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
      // Required only once an image has been uploaded, so optional images can stay empty.
      validation: (rule) => [
        rule.custom((alt, context) => {
          if (isInactiveVariantOverride(context)) return true
          const hasAsset = Boolean((context.parent as ImageValue | undefined)?.asset)
          return hasAsset && !alt ? 'Escribe un texto alternativo para la imagen' : true
        }),
        rule.max(160),
        trimmedString(rule),
      ],
    }),
  ],
})

/** Validation for a gallery (array of galleryImage): at least one photo and no empty slots. */
export const validateGallery = (images: unknown, emptyMessage: string) => {
  const items = (images as ImageValue[] | undefined) ?? []
  if (items.length === 0) return emptyMessage
  return items.every((item) => item?.asset) ? true : 'Hay un hueco sin foto en la galería: sube una imagen o quítalo'
}
