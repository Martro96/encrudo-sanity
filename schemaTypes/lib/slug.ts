import type {SlugRule} from 'sanity'

export const SLUG_MAX_LENGTH = 96

/** "Póster Año Nuevo 50×70" -> "poster-ano-nuevo-50-70" */
export const slugify = (input: string) =>
  input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/^-+|-+$/g, '')

export const slugFormat = (rule: SlugRule) =>
  rule.custom((value) => {
    const current = (value as {current?: string} | undefined)?.current
    if (!current) return true
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(current)
      ? true
      : 'Usa solo minúsculas sin acentos, números y guiones (ej.: blanco-y-negro)'
  })
