import { createApp } from 'vue'
import App from './App.vue'
import "./index.css";
import { defaultEnvKey, defaultUrlKey } from './types/index'

const drupalEnv = {
  local: 'https://d9.ddev.site',
  dev: "https://dev.intranet.babson.edu",
  stage: "https://stage.intranet.babson.edu",
  stage2: "https://stage2.intranet.babson.edu",
  prod: "https://intranet.babson.edu"
}
const feedUrl = "/jsonapi/"

const app = createApp(App)
app.provide(defaultEnvKey, drupalEnv.prod)
app.provide(defaultUrlKey, drupalEnv.prod + feedUrl)
app.mount('#app')
