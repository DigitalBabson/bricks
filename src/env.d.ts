/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV_DRUPAL_ENDPOINT: string
  readonly DEV_SEARCHSTAX_ENDPOINT: string
  readonly DEV_SEARCHSTAX_TOKEN: string
  readonly DEV_HERO_IMAGE: string
  readonly DEV_PLACEHOLDER_IMAGE_UUID: string
  readonly DEV_PLACEHOLDER_IMAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
