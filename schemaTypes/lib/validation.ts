import type {StringRule} from 'sanity'

export const trimmedString = (rule: StringRule) =>
  rule.custom((value) => {
    if (typeof value !== 'string') return true
    if (value.trim() === '') return 'No puede estar vacío ni contener solo espacios'
    if (value !== value.trim()) return 'Quita los espacios al principio o al final'
    if (/\s{2,}/.test(value)) return 'Evita espacios dobles'
    return true
  })
