import {at, defineMigration, set} from 'sanity/migrate'

type Item = {_key: string; _type: string; _ref?: string}

/**
 * homePage.featuredProducts: plain product references → `featuredProduct` items
 * ({product, variantKey?}). Keeps each item's `_key` and order; no version is selected.
 */
export default defineMigration({
  title: 'Página de inicio: productos destacados como elementos {product, variantKey}',
  documentTypes: ['homePage'],
  migrate: {
    document(doc) {
      const items = (doc.featuredProducts as Item[] | undefined) ?? []
      if (!items.some((item) => item._type === 'reference')) return undefined
      return at(
        'featuredProducts',
        set(
          items.map((item) =>
            item._type === 'reference'
              ? {
                  _key: item._key,
                  _type: 'featuredProduct',
                  product: {_type: 'reference', _ref: item._ref},
                }
              : item,
          ),
        ),
      )
    },
  },
})
