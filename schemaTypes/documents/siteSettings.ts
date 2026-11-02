import {CogIcon} from '@sanity/icons/Cog'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {EDITORIAL_HELP, editorialBlock} from '../lib/editorialText'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Ajustes del sitio',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'pricingExplanation',
      title: 'Explicación del rango de precio',
      description: `Texto que ven los clientes en la ficha de producto para entender cómo funciona el precio: el precio mínimo, el recomendado, el de apoyo y que pueden elegir cuánto pagar a partir del mínimo. Es el mismo para todos los productos. No escribas importes aquí: los precios de cada producto o versión se ponen en el propio producto. ${EDITORIAL_HELP}`,
      type: 'array',
      of: [editorialBlock({bulletList: true})],
      validation: (rule) => rule.required().error('Escribe la explicación del rango de precio'),
    }),
    defineField({
      name: 'contactEmail',
      title: 'Email de contacto',
      description: 'Dirección de email pública que aparece en la web para que la gente pueda escribir a Encrudo.',
      type: 'string',
      validation: (rule) => rule.required().email().error('Introduce un email válido, ej.: hola@encrudo.com'),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Redes sociales',
      description:
        'Enlaces a los perfiles públicos de Encrudo. Se muestran en la web en el mismo orden que en esta lista.',
      type: 'array',
      of: [defineArrayMember({type: 'socialLink'})],
      validation: (rule) =>
        rule.custom((links) => {
          const platforms = ((links as {platform?: string}[] | undefined) ?? [])
            .map((link) => link.platform)
            .filter((platform) => platform && platform !== 'other')
          return new Set(platforms).size === platforms.length
            ? true
            : 'Hay dos enlaces de la misma red social'
        }),
    }),
  ],
  preview: {prepare: () => ({title: 'Ajustes del sitio'})},
})
