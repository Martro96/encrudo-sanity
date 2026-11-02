import {defineField, defineType, type ValidationContext} from 'sanity'
import {isInactiveVariantOverride} from '../lib/validation'

type PricingValue = {minimumPrice?: number; recommendedPrice?: number; supportPrice?: number}

const decimals = (n: number) => Math.abs(Math.round(n * 100) - n * 100) < 1e-9

const priceRule =
  (check: (value: number | undefined, prices: PricingValue) => string | true) =>
  (value: unknown, context: ValidationContext) => {
    if (isInactiveVariantOverride(context)) return true
    if (typeof value === 'number' && !decimals(value)) return 'Usa como máximo 2 decimales'
    return check(value as number | undefined, (context.parent as PricingValue | undefined) ?? {})
  }

export const pricing = defineType({
  name: 'pricing',
  title: 'Precios',
  type: 'object',
  description:
    'Encrudo funciona con "paga lo que quieras a partir de un mínimo": en la web cada persona puede pagar el mínimo o más. Importes en euros, con hasta 2 decimales (ej.: 12,50). Cada precio debe ser igual o mayor que el anterior.',
  options: {columns: 3},
  fields: [
    defineField({
      name: 'minimumPrice',
      title: 'Mínimo (€)',
      description: 'Lo menos que se puede pagar. Mayor que 0.',
      type: 'number',
      validation: (rule) =>
        rule.custom(
          priceRule((value) => {
            if (value === undefined) return 'Indica el precio mínimo'
            return value > 0 ? true : 'El precio mínimo debe ser mayor que 0'
          }),
        ),
    }),
    defineField({
      name: 'recommendedPrice',
      title: 'Recomendado (€)',
      description: 'El precio sugerido. Igual o mayor que el mínimo.',
      type: 'number',
      validation: (rule) =>
        rule.custom(
          priceRule((value, {minimumPrice}) => {
            if (value === undefined) return 'Indica el precio recomendado'
            return minimumPrice === undefined || value >= minimumPrice
              ? true
              : 'Debe ser igual o mayor que el precio mínimo'
          }),
        ),
    }),
    defineField({
      name: 'supportPrice',
      title: 'De apoyo (€)',
      description: 'Para quien quiera apoyar el proyecto. Igual o mayor que el recomendado.',
      type: 'number',
      validation: (rule) =>
        rule.custom(
          priceRule((value, {recommendedPrice}) => {
            if (value === undefined) return 'Indica el precio de apoyo'
            return recommendedPrice === undefined || value >= recommendedPrice
              ? true
              : 'Debe ser igual o mayor que el precio recomendado'
          }),
        ),
    }),
  ],
})
