import { createApp } from 'vue'
import App from './App.vue'
import "./index.css";
import { defaultEnvKey, defaultUrlKey } from './types/index'

// Read the Drupal JSON:API endpoint from .env (e.g. https://babsondev.prod.acquia-sites.com/jsonapi/)
// Falls back to the production intranet endpoint if the env var is not set.
const drupalEndpoint = (import.meta.env.DEV_DRUPAL_ENDPOINT ?? '').trim() || 'https://intranet.babson.edu/jsonapi/'

// Derive the base origin (without path) for resolving relative file URLs like /sites/default/files/...
const endpointUrl = new URL(drupalEndpoint)
const drupalOrigin = endpointUrl.origin

const app = createApp(App)
app.provide(defaultEnvKey, drupalOrigin)
app.provide(defaultUrlKey, drupalEndpoint)
app.mount('#app')
