import {defineField, defineType} from 'sanity'

export const pricing = defineType({
  name: 'pricing',
  title: 'Precios',
  type: 'object',
  description:
    'Modelo "paga lo que quieras a partir de un mínimo". Importes en euros (EUR), con hasta 2 decimales.',
  options: {columns: 3},
  fields: [
    defineField({
      name: 'minimumPrice',
      title: 'Precio mínimo (€)',
      description: 'Importe más bajo que el visitante puede pagar. Debe ser mayor que 0.',
      type: 'number',
      validation: (rule) => [
        rule.required(),
        rule.greaterThan(0).error('Debe ser mayor que 0'),
        rule.precision(2),
      ],
    }),
    defineField({
      name: 'recommendedPrice',
      title: 'Precio recomendado (€)',
      description: 'Precio sugerido por defecto. Igual o mayor que el mínimo.',
      type: 'number',
      validation: (rule) => [
        rule.required(),
        rule.min(rule.valueOfField('minimumPrice')).error('Debe ser igual o mayor que el precio mínimo'),
        rule.precision(2),
      ],
    }),
    defineField({
      name: 'supportPrice',
      title: 'Precio de apoyo (€)',
      description: 'Para quien quiera apoyar el proyecto. Igual o mayor que el recomendado.',
      type: 'number',
      validation: (rule) => [
        rule.required(),
        rule.min(rule.valueOfField('recommendedPrice')).error('Debe ser igual o mayor que el precio recomendado'),
        rule.precision(2),
      ],
    }),
  ],
})
