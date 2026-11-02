import type {Path, StringRule, ValidationContext} from 'sanity'

export const trimmedString = (rule: StringRule) =>
  rule.custom((value) => {
    if (typeof value !== 'string') return true
    if (value.trim() === '') return 'No puede estar vacío ni contener solo espacios'
    if (value !== value.trim()) return 'Quita los espacios al principio o al final'
    if (/\s{2,}/.test(value)) return 'Evita espacios dobles'
    return true
  })

const OVERRIDE_FLAGS: Record<string, string> = {images: 'hasOwnImages', pricing: 'hasOwnPricing'}

/**
 * True when the value lives inside a variant override (images/pricing) that is switched off.
 * Hidden fields are still validated by Sanity, so stale override data must not block publishing.
 */
export const isInactiveVariantOverride = (context: ValidationContext) => {
  const path: Path = context.path ?? []
  const [root, variantSegment, field] = path
  const flag = typeof field === 'string' ? OVERRIDE_FLAGS[field] : undefined
  if (root !== 'variants' || !flag || typeof variantSegment !== 'object' || !('_key' in variantSegment)) {
    return false
  }
  const variants = (context.document?.variants as Array<Record<string, unknown>> | undefined) ?? []
  const variant = variants.find((v) => v._key === variantSegment._key)
  return variant?.[flag] !== true
}
