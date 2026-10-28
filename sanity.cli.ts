import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'apzq1m8q',
    dataset: 'production',
  },
  deployment: {
    autoUpdates: true,
  },
})
