import type { InjectionKey } from 'vue'

// Typed injection keys (used in App.vue provide, TheBricks + BrickCard inject)
export const defaultEnvKey: InjectionKey<string> = Symbol('defaultEnv')
export const defaultUrlKey: InjectionKey<string> = Symbol('defaultUrl')

export interface Brick {
  id: string
  number: string
  inscription: string
  brickImage: string
  brickParkLocation: string
}

export interface BrickApiItem {
  id: string
  attributes: { brickNumber: string; brickInscription: string }
  relationships: {
    brickImage: { data: { id: string } | null }
    brickParkLocation: { data: { id: string } | null }
  }
}

export interface BrickApiResponse {
  data: BrickApiItem[]
  links: { next?: { href: string } }
  meta?: { count?: number }
}

export interface ImageStyleUri {
  brick?: string
  full_img?: string
  [key: string]: string | undefined
}

export interface MediaImageApiResponse {
  data: unknown
  included?: Array<{
    attributes: { image_style_uri?: ImageStyleUri }
  }>
}

export interface ParkLocationApiResponse {
  data: { attributes: { name: string } }
  included?: Array<{
    attributes: { image_style_uri?: { full_img?: string } }
  }>
}
