import {Card, Select, Text} from '@sanity/ui'
import {useEffect, useState} from 'react'
import {set, unset, useClient, useFormValue, type StringInputProps} from 'sanity'
import {
  fetchVariants,
  variantLabel,
  VARIANTS_API_VERSION,
  type VariantOption,
} from '../lib/variants'

/** Lists only the versions of the product selected in the same featured item. */
export function VariantKeyInput(props: StringInputProps) {
  const {value, onChange, readOnly, path, elementProps} = props
  const productId = useFormValue([...path.slice(0, -1), 'product', '_ref']) as string | undefined
  const client = useClient({apiVersion: VARIANTS_API_VERSION})
  const [variants, setVariants] = useState<VariantOption[] | null>(null)

  useEffect(() => {
    if (!productId) return setVariants([])
    let active = true
    setVariants(null)
    fetchVariants(client, productId).then(
      (result) => active && setVariants(result),
      () => active && setVariants([]),
    )
    return () => {
      active = false
    }
  }, [client, productId])

  if (variants === null) {
    return (
      <Text size={1} muted>
        Cargando versiones…
      </Text>
    )
  }

  if (variants.length === 0 && !value) {
    return (
      <Card tone="transparent" border radius={2} style={{padding: 12}}>
        <Text size={1} muted>
          Este producto no tiene versiones publicadas: se mostrará el producto principal.
        </Text>
      </Card>
    )
  }

  const missing = Boolean(value) && !variants.some((variant) => variant._key === value)

  return (
    <Select
      id={elementProps.id}
      ref={elementProps.ref as never}
      onFocus={elementProps.onFocus as never}
      onBlur={elementProps.onBlur as never}
      readOnly={readOnly}
      disabled={readOnly}
      value={value ?? ''}
      onChange={(event) => {
        const next = event.currentTarget.value
        onChange(next ? set(next) : unset())
      }}
    >
      <option value="">Producto principal (sin versión concreta)</option>
      {variants.map((variant) => (
        <option key={variant._key} value={variant._key}>
          {variantLabel(variant) || 'Versión sin nombre'}
        </option>
      ))}
      {missing && (
        <option value={value} disabled>
          Versión que ya no existe
        </option>
      )}
    </Select>
  )
}
