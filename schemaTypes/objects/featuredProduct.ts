import {StarIcon} from '@sanity/icons/Star'
import {defineField, defineType} from 'sanity'
import {FeaturedProductInput} from '../components/FeaturedProductInput'
import {VariantKeyInput} from '../components/VariantKeyInput'
import {fetchVariants, variantLabel, VARIANTS_API_VERSION} from '../lib/variants'

type Parent = {product?: {_ref?: string}} | undefined
type Image = {asset?: unknown}
type Variant = {
  _key: string
  format?: string
  colour?: string
  finish?: string
  hasOwnImages?: boolean
  images?: Image[]
}

export const MISSING_VARIANT =
  'La versión seleccionada ya no existe en este producto. Elige otra versión o deja el campo vacío.'

/** Homepage item: a product, optionally narrowed to one of its embedded versions by `_key`. */
export const featuredProduct = defineType({
  name: 'featuredProduct',
  title: 'Producto destacado',
  type: 'object',
  icon: StarIcon,
  components: {input: FeaturedProductInput},
  fields: [
    defineField({
      name: 'product',
      title: 'Producto',
      description: 'Elige el producto que quieres destacar.',
      type: 'reference',
      to: [{type: 'product'}],
      options: {
        disableNew: true,
        filter: '!(_id in path("drafts.**")) && visible != false',
      },
      validation: (rule) => rule.required().error('Elige el producto que quieres destacar'),
    }),
    defineField({
      name: 'variantKey',
      title: 'Versión destacada',
      description:
        'Opcional. Si quieres mostrar una versión concreta del producto, selecciónala aquí. Si la dejas vacía, se utilizará el producto principal.',
      type: 'string',
      components: {input: VariantKeyInput},
      hidden: ({parent}) => !(parent as Parent)?.product?._ref,
      validation: (rule) =>
        rule.custom(async (key, context) => {
          if (!key) return true
          const productId = (context.parent as Parent)?.product?._ref
          if (!productId) return 'Elige primero el producto'
          const variants = await fetchVariants(
            context.getClient({apiVersion: VARIANTS_API_VERSION}),
            productId,
          )
          return variants.some((variant) => variant._key === key) ? true : MISSING_VARIANT
        }),
    }),
  ],
  preview: {
    select: {
      title: 'product.title',
      visible: 'product.visible',
      variants: 'product.variants',
      cardImage: 'product.cardImage',
      firstImage: 'product.images.0',
      variantKey: 'variantKey',
    },
    prepare: ({title, visible, variants, cardImage, firstImage, variantKey}) => {
      const variant = variantKey
        ? (variants as Variant[] | undefined)?.find((v) => v._key === variantKey)
        : undefined
      const label = variant && variantLabel(variant)
      const variantImage = variant?.hasOwnImages ? variant.images?.[0] : undefined
      const status = variantKey
        ? variant
          ? 'Versión destacada'
          : 'La versión seleccionada ya no existe'
        : 'Producto principal'
      return {
        title: [title ?? 'Elige un producto', label].filter(Boolean).join(' · '),
        subtitle: visible === false ? `${status} · oculto en el catálogo` : status,
        media: variantImage?.asset
          ? variantImage
          : (cardImage as Image)?.asset
            ? cardImage
            : firstImage,
      }
    },
  },
})
