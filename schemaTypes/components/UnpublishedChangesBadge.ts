import type {DocumentBadgeComponent} from 'sanity'

const HINT = 'Los cambios se guardan como borrador automáticamente. Pulsa Publicar para aplicarlos a la web.'

export const UnpublishedChangesBadge: DocumentBadgeComponent = ({draft, published}) => {
  if (!draft) return null
  return {
    label: published ? 'Cambios sin publicar' : 'Sin publicar',
    title: HINT,
    color: 'warning',
  }
}
