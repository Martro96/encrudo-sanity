import {defineField, defineType} from 'sanity'

export const pricing = defineType({
  name: 'pricing',
  title: 'Precios',
  type: 'object',
  description:
    'Encrudo funciona con "paga lo que quieras a partir de un mínimo". Importes en euros, con hasta 2 decimales (ej.: 12,50). Cada precio debe ser igual o mayor que el anterior.',
  options: {columns: 3},
  fields: [
    defineField({
      name: 'minimumPrice',
      title: 'Mínimo (€)',
      description: 'Lo menos que se puede pagar. Mayor que 0.',
      type: 'number',
      validation: (rule) => [
        rule.required().error('Indica el precio mínimo'),
        rule.greaterThan(0).error('El precio mínimo debe ser mayor que 0'),
        rule.precision(2),
      ],
    }),
    defineField({
      name: 'recommendedPrice',
      title: 'Recomendado (€)',
      description: 'El precio sugerido. Igual o mayor que el mínimo.',
      type: 'number',
      validation: (rule) => [
        rule.required().error('Indica el precio recomendado'),
        rule.min(rule.valueOfField('minimumPrice')).error('Debe ser igual o mayor que el precio mínimo'),
        rule.precision(2),
      ],
    }),
    defineField({
      name: 'supportPrice',
      title: 'De apoyo (€)',
      description: 'Para quien quiera apoyar el proyecto. Igual o mayor que el recomendado.',
      type: 'number',
      validation: (rule) => [
        rule.required().error('Indica el precio de apoyo'),
        rule.min(rule.valueOfField('recommendedPrice')).error('Debe ser igual o mayor que el precio recomendado'),
        rule.precision(2),
      ],
    }),
  ],
})
