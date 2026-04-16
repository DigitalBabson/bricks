import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function resolvePagesBase(): string {
  const explicitBase = process.env.PAGES_BASE_PATH?.trim()
  if (explicitBase) {
    return explicitBase.startsWith('/') ? explicitBase : `/${explicitBase}`
  }

  if (process.env.GITHUB_ACTIONS === 'true') {
    const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]?.trim()
    if (repositoryName) {
      return `/${repositoryName}/`
    }
  }

  return '/'
}

// https://vitejs.dev/config/
export default defineConfig({
  base: resolvePagesBase(),
  plugins: [vue()],
  envPrefix: 'DEV_',
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      // https://rollupjs.org/guide/en/#big-list-of-options
    },
  },
});
