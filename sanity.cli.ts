import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'apzq1m8q',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // `sanity deploy` publishes the Studio at https://encrudo-admin.sanity.studio
  studioHost: 'encrudo-admin',
  deployment: {
    autoUpdates: true,
  },
})
