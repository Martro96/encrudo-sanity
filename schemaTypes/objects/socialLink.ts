import {defineField, defineType} from 'sanity'

const PLATFORMS = [
  {title: 'Instagram', value: 'instagram'},
  {title: 'TikTok', value: 'tiktok'},
  {title: 'YouTube', value: 'youtube'},
  {title: 'Otra', value: 'other'},
]

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Red social',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Plataforma',
      type: 'string',
      options: {list: PLATFORMS, layout: 'dropdown'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['https']}),
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
