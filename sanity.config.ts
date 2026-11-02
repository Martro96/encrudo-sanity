import {defineConfig, isDev} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {esESLocale} from '@sanity/locale-es-es'
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

  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETON_TYPES.has(schemaType)),
  },

  document: {
    actions: (actions, {schemaType}) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(({action}) => action && SINGLETON_ACTIONS.has(action))
        : actions,
    newDocumentOptions: (options) =>
      options.filter(({templateId}) => !SINGLETON_TYPES.has(templateId)),
  },
})
