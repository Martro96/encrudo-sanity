import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'

type Ref = {_ref?: string}

export const homePage = defineType({
  name: 'homePage',
  title: 'Página de inicio',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'featuredProducts',
      title: 'Productos destacados',
      description:
        'Productos que se muestran destacados en la página de inicio. El orden de esta lista es el orden en que aparecen en la web: arrastra para reordenarlos. Solo se pueden elegir productos publicados y visibles en el catálogo, y cada uno una sola vez. Los cambios se guardan como borrador automáticamente. Pulsa Publicar para aplicarlos a la web y liberar referencias eliminadas (por ejemplo, para poder borrar un producto que has quitado de esta lista).',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          title: 'Producto',
          to: [{type: 'product'}],
          options: {
            disableNew: true,
            filter: ({document}) => {
              const selected = ((document?.featuredProducts as Ref[] | undefined) ?? [])
                .map((ref) => ref._ref)
                .filter(Boolean)
              return {
                filter: '!(_id in path("drafts.**")) && visible != false && !(_id in $selected)',
                params: {selected},
              }
            },
          },
        }),
      ],
      validation: (rule) => [
        rule.unique().error('Este producto ya está en la lista. Cada producto solo puede aparecer una vez.'),
        rule.max(12).warning('Más de 12 productos destacados puede saturar la página de inicio.'),
        rule.custom(async (refs, context) => {
          const ids = ((refs as Ref[] | undefined) ?? []).map((ref) => ref._ref).filter(Boolean)
          if (ids.length === 0) return true
          const hidden = await context
            .getClient({apiVersion: '2025-01-01'})
            .withConfig({perspective: 'published'})
            .fetch<string[]>('*[_type == "product" && _id in $ids && visible == false].title', {ids})
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
