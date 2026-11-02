export const formatEuros = (value: unknown) =>
  typeof value === 'number'
    ? value.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})
    : null
