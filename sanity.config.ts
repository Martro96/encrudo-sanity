import {defineConfig, defineLocaleResourceBundle, isDev} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {esESLocale} from '@sanity/locale-es-es'
import {UnpublishedChangesBadge} from './schemaTypes/components/UnpublishedChangesBadge'
import {schemaTypes} from './schemaTypes'
import {SINGLETON_TYPES, structure} from './structure'

// Dataset selection is configuration, not a secret. Defaults to production.
// Use `SANITY_STUDIO_DATASET=development npm run dev` for internal UAT.
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: dataset === 'production' ? 'Encrudo' : `Encrudo (${dataset})`,

  projectId: 'apzq1m8q',
  dataset,

  plugins: [
    structureTool({structure, title: 'Contenido'}),
    esESLocale(),
    // GROQ query tool: only for local development, hidden in the deployed Studio.
    ...(isDev ? [visionTool()] : []),
  ],

  i18n: {
    bundles: [
      // Unpublished documents are titled "Nuevo <tipo>" by default, which is ungrammatical for
      // feminine types and confusing for singletons ("Nuevo Página de inicio"). Show the type only.
      defineLocaleResourceBundle({
        locale: 'es-ES',
        namespace: 'structure',
        resources: {'panes.document-header-title.new.text': '{{schemaType}}'},
      }),
      // The global perspective switch is not a "drafts only" filter: it is the working view where
      // drafts take precedence over published content. Name it for what it shows.
      defineLocaleResourceBundle({
        locale: 'es-ES',
        namespace: 'studio',
        resources: {
          'release.navbar.drafts': 'Vista de trabajo',
          'release.chip.global.drafts': 'Vista de trabajo',
          'release.navbar.published': 'Web publicada',
          'release.navbar.tooltip':
            'Vista de trabajo: lo que estás editando, con los borradores. Web publicada: lo que ve el público.',
        },
      }),
    ],
  },

  // Edit → autosaved draft → Publicar. No release management or scheduling for this shop.
  releases: {enabled: false},
  scheduledDrafts: {enabled: false},

  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETON_TYPES.has(schemaType)),
  },

  document: {
    badges: (badges) => [...badges, UnpublishedChangesBadge],
    actions: (actions, {schemaType}) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(({action}) => action && SINGLETON_ACTIONS.has(action))
        : actions,
    newDocumentOptions: (options) =>
      options.filter(({templateId}) => !SINGLETON_TYPES.has(templateId)),
  },
})
