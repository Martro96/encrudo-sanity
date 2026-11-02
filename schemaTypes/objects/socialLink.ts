import {LinkIcon} from '@sanity/icons/Link'
import {defineField, defineType} from 'sanity'

const PLATFORMS = [
  {title: 'Instagram', value: 'instagram', domains: ['instagram.com']},
  {title: 'TikTok', value: 'tiktok', domains: ['tiktok.com']},
  {title: 'YouTube', value: 'youtube', domains: ['youtube.com', 'youtu.be']},
  {title: 'Otra', value: 'other', domains: []},
]

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Red social',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'platform',
      title: 'Red social',
      type: 'string',
      options: {list: PLATFORMS.map(({title, value}) => ({title, value})), layout: 'radio', direction: 'horizontal'},
      initialValue: 'instagram',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Enlace al perfil',
      description: 'Dirección completa, empezando por https://. Ej.: https://www.instagram.com/encrudo',
      type: 'url',
      validation: (rule) => [
        rule.required().uri({scheme: ['https']}).error('Introduce un enlace completo que empiece por https://'),
        rule.custom((url, context) => {
          const platform = PLATFORMS.find((p) => p.value === (context.parent as {platform?: string})?.platform)
          if (!url || !platform || platform.domains.length === 0) return true
          let host: string
          try {
            host = new URL(url).hostname.replace(/^www\./, '')
          } catch {
            return true
          }
          return platform.domains.some((d) => host === d || host.endsWith(`.${d}`))
            ? true
            : {message: `Este enlace no parece de ${platform.title}`, level: 'warning'}
        }),
      ],
    }),
  ],
  preview: {
    select: {platform: 'platform', url: 'url'},
    prepare: ({platform, url}) => ({
      title: PLATFORMS.find((p) => p.value === platform)?.title ?? 'Red social',
      subtitle: url,
    }),
  },
})
