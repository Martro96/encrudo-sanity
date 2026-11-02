import type {SanityClient} from 'sanity'

export type VariantOption = {_key: string; format?: string; colour?: string; finish?: string}

export const VARIANTS_API_VERSION = '2025-01-01'

export const variantLabel = (variant: Omit<VariantOption, '_key'>) =>
  [variant.format, variant.colour, variant.finish].filter(Boolean).join(' · ')

/** Versions of the published product: the homepage only links to published content. */
export const fetchVariants = (client: SanityClient, productId: string) =>
  client
    .withConfig({apiVersion: VARIANTS_API_VERSION, perspective: 'published'})
    .fetch<VariantOption[] | null>('*[_id == $id][0].variants[]{_key, format, colour, finish}', {
      id: productId,
    })
    .then((variants) => variants ?? [])
