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
    'Cuando la imagen aparece aquí, ya está subida y guardada en el borrador. Puedes marcar el punto de interés para que los recortes no corten lo importante.',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Texto alternativo',
      description:
        'Imagen subida. Los cambios se guardan automáticamente. Describe brevemente lo que se ve (lo leen los lectores de pantalla y los buscadores), ej.: "Fanzine Blanco y Negro A5, portada en tinta roja". Cuando termines, cierra la imagen con la X: no se pierde nada.',
      type: 'string',
      // Required only once an image has been uploaded, so optional images can stay empty.
      validation: (rule) => [
        rule.custom((alt, context) => {
          if (isInactiveVariantOverride(context)) return true
          const hasAsset = Boolean((context.parent as ImageValue | undefined)?.asset)
          return hasAsset && !alt ? 'Imagen subida · falta el texto alternativo' : true
        }),
        rule.max(160),
        trimmedString(rule),
      ],
    }),
  ],
  preview: {
    select: {alt: 'alt', media: 'asset'},
    prepare: ({alt, media}) => ({
      title: media ? (alt ? 'Imagen lista' : 'Falta texto alternativo') : 'Sin imagen',
      subtitle: media ? alt : 'Sube una imagen o quita este hueco',
      media,
    }),
  },
})

/** Validation for a gallery (array of galleryImage): at least one photo and no empty slots. */
export const validateGallery = (images: unknown, emptyMessage: string) => {
  const items = (images as ImageValue[] | undefined) ?? []
  if (items.length === 0) return emptyMessage
  return items.every((item) => item?.asset) ? true : 'Hay un hueco sin foto en la galería: sube una imagen o quítalo'
}
