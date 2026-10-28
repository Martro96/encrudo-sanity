import type {StructureResolver} from 'sanity/structure'

export const SINGLETON_TYPES = new Set(['siteSettings'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.documentTypeListItem('product').title('Productos'),
      S.documentTypeListItem('category').title('Categorías'),
      S.documentTypeListItem('tag').title('Etiquetas'),
      S.divider(),
      S.listItem()
        .title('Ajustes del sitio')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
