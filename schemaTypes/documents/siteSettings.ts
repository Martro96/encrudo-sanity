import {CogIcon} from '@sanity/icons/Cog'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Ajustes del sitio',
  type: 'document',
  icon: CogIcon,
  fields: [
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
