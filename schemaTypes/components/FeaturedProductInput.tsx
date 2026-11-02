import {useEffect, useRef} from 'react'
import {unset, useClient, type ObjectInputProps} from 'sanity'
import {fetchVariants, VARIANTS_API_VERSION} from '../lib/variants'

type Item = {product?: {_ref?: string}; variantKey?: string}

/**
 * When the editor switches product, drops a selected version that the new product doesn't have.
 * An obsolete version on an unchanged product is kept so validation can flag it.
 */
export function FeaturedProductInput(props: ObjectInputProps) {
  const {onChange} = props
  const value = props.value as Item | undefined
  const productId = value?.product?._ref
  const variantKey = value?.variantKey
  const client = useClient({apiVersion: VARIANTS_API_VERSION})
  const previousProductId = useRef(productId)

  useEffect(() => {
    const previous = previousProductId.current
    previousProductId.current = productId
    if (previous === productId || !variantKey) return
    if (!productId) return onChange(unset(['variantKey']))

    let active = true
    fetchVariants(client, productId).then((variants) => {
      if (active && !variants.some((variant) => variant._key === variantKey)) {
        onChange(unset(['variantKey']))
      }
    })
    return () => {
      active = false
    }
  }, [client, productId, variantKey, onChange])

  return props.renderDefault(props)
}
