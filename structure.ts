import {CogIcon} from '@sanity/icons/Cog'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {HomeIcon} from '@sanity/icons/Home'
import {PackageIcon} from '@sanity/icons/Package'
import {TagIcon} from '@sanity/icons/Tag'
import {TagsIcon} from '@sanity/icons/Tags'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'

export const SINGLETON_TYPES = new Set(['homePage', 'projectPage', 'siteSettings'])

const singleton = (S: StructureBuilder, typeName: string, title: string, icon: typeof HomeIcon) =>
  S.listItem()
    .title(title)
    .id(typeName)
    .icon(icon)
    .child(S.document().schemaType(typeName).documentId(typeName).title(title))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.divider().title('Tienda'),
      S.listItem()
        .title('Productos')
        .icon(PackageIcon)
        .schemaType('product')
        .child(
          S.documentTypeList('product')
            .title('Productos')
            .defaultOrdering([{field: 'title', direction: 'asc'}]),
        ),
      S.listItem()
        .title('Categorías')
        .icon(TagsIcon)
        .schemaType('category')
        .child(
          S.documentTypeList('category')
            .title('Categorías')
            .defaultOrdering([{field: 'title', direction: 'asc'}]),
        ),
      S.listItem()
        .title('Etiquetas')
        .icon(TagIcon)
        .schemaType('tag')
        .child(
          S.documentTypeList('tag')
            .title('Etiquetas')
            .defaultOrdering([{field: 'title', direction: 'asc'}]),
        ),

      S.divider().title('Web'),
      singleton(S, 'homePage', 'Página de inicio', HomeIcon),
      singleton(S, 'projectPage', 'Proyecto', DocumentTextIcon),

      S.divider().title('Configuración'),
      singleton(S, 'siteSettings', 'Ajustes del sitio', CogIcon),
    ])
