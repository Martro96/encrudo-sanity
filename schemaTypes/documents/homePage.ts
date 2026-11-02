import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {EDITORIAL_HELP, editorialBlock, editorialTextNotBlank} from '../lib/editorialText'
import {trimmedString} from '../lib/validation'

type Item = {_type?: string; product?: {_ref?: string}; variantKey?: string}

export const homePage = defineType({
  name: 'homePage',
  title: 'Página de inicio',
  type: 'document',
  icon: HomeIcon,
  fieldsets: [
    {
      name: 'intro',
      title: 'Introducción',
      description: 'Texto que aparece justo debajo de la imagen de cabecera.',
    },
  ],
  fields: [
    defineField({
      name: 'introHeading',
      title: 'Título',
      description: 'Ej.: "Encrudo se mueve".',
      type: 'string',
      fieldset: 'intro',
      validation: (rule) => [
        rule.required().error('Escribe el título'),
        rule.max(60),
        trimmedString(rule),
      ],
    }),
    defineField({
      name: 'introText',
      title: 'Texto',
      description: `Párrafo de presentación. ${EDITORIAL_HELP}`,
      type: 'array',
      of: [editorialBlock()],
      fieldset: 'intro',
      validation: (rule) => [
        rule.required().error('Escribe el texto de presentación'),
        editorialTextNotBlank(rule, 'El texto de presentación está vacío: escribe al menos una frase.'),
      ],
    }),
    defineField({
      name: 'introLinkLabel',
      title: 'Texto del enlace a Proyecto',
      description:
        'Texto del enlace que lleva a la página Proyecto (ej.: "Más sobre Encrudo"). El destino no se cambia aquí.',
      type: 'string',
      fieldset: 'intro',
      initialValue: 'Más sobre Encrudo',
      validation: (rule) => [
        rule.required().error('Escribe el texto del enlace'),
        rule.max(40),
        trimmedString(rule),
      ],
    }),
    defineField({
      name: 'featuredProducts',
      title: 'Productos destacados',
      description:
        'Productos que se muestran destacados en la página de inicio. En cada uno puedes elegir, si quieres, una versión concreta (ej.: A5 · Rojo · Mate). El orden de esta lista es el orden en que aparecen en la web: arrastra para reordenarlos. Solo se pueden elegir productos publicados y visibles en el catálogo. Un mismo producto solo puede repetirse con versiones distintas. Los cambios se guardan como borrador automáticamente. Pulsa Publicar para aplicarlos a la web y liberar referencias eliminadas (por ejemplo, para poder borrar un producto que has quitado de esta lista).',
      type: 'array',
      of: [defineArrayMember({type: 'featuredProduct'})],
      validation: (rule) => [
        rule.max(12).warning('Más de 12 productos destacados puede saturar la página de inicio.'),
        rule.custom((items) => {
          const list = (items as Item[] | undefined) ?? []
          if (list.some((item) => item._type === 'reference')) {
            return 'Hay elementos con el formato anterior. Quítalos y vuelve a añadir esos productos (o ejecuta la migración featured-products-items).'
          }
          const seen = new Set<string>()
          const duplicate = list.some((item) => {
            if (!item.product?._ref) return false
            const id = `${item.product._ref}:${item.variantKey ?? ''}`
            if (seen.has(id)) return true
            seen.add(id)
            return false
          })
          return duplicate
            ? 'Este producto (o esta versión) ya está en la lista. Cada producto o versión solo puede aparecer una vez.'
            : true
        }),
        rule.custom(async (items, context) => {
          const ids = ((items as Item[] | undefined) ?? [])
            .map((item) => item.product?._ref)
            .filter(Boolean)
          if (ids.length === 0) return true
          const hidden = await context
            .getClient({apiVersion: '2025-01-01'})
            .withConfig({perspective: 'published'})
            .fetch<string[]>('*[_type == "product" && _id in $ids && visible == false].title', {
              ids,
            })
          return hidden.length === 0
            ? true
            : {
                message: `Estos productos están ocultos en el catálogo y no se mostrarán: ${hidden.join(', ')}`,
                level: 'warning',
              }
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Página de inicio'})},
})
