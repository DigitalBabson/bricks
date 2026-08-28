import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'

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

// Modes whose output gets deployed. The committed .env.[mode] files carry a
// placeholder token by design — the real one belongs in a gitignored
// .env.[mode].local sibling. If the placeholder survives into a build,
// SearchStax rejects every keyword search and TheBricks quietly falls back to
// Drupal CONTAINS, so the bundle looks fine while the search path it was built
// to exercise never runs.
const DEPLOYABLE_MODES = new Set(['stage', 'stage2', 'production'])
const PLACEHOLDER_TOKEN = /^your-.*token-here$/

function checkSearchstaxToken(mode: string, command: 'build' | 'serve'): void {
  if (!DEPLOYABLE_MODES.has(mode)) {
    return
  }

  const token = loadEnv(mode, process.cwd(), 'DEV_').DEV_SEARCHSTAX_TOKEN?.trim() ?? ''

  let problem = ''
  if (!token) {
    problem = 'DEV_SEARCHSTAX_TOKEN is empty or unset'
  } else if (PLACEHOLDER_TOKEN.test(token)) {
    problem = `DEV_SEARCHSTAX_TOKEN is still the placeholder ("${token}")`
  }

  if (!problem) {
    return
  }

  const message = [
    `${problem} for --mode ${mode}.`,
    'SearchStax will reject every keyword search and the app will fall back to',
    'Drupal CONTAINS without surfacing an error.',
    `Fix: create .env.${mode}.local (gitignored) containing the real token.`,
  ].join('\n  ')

  // Fail the build — a bad bundle is the thing worth stopping. On the dev
  // server, warn instead so browsing without search still works.
  if (command === 'build') {
    throw new Error(`[searchstax] ${message}`)
  }

  console.warn(`\n[searchstax] ${message}\n`)
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  checkSearchstaxToken(mode, command)

  return {
    base: resolvePagesBase(),
    plugins: [vue(), cssInjectedByJs()],
    envPrefix: 'DEV_',
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
        // https://rollupjs.org/guide/en/#big-list-of-options
      },
    },
  }
})
