import type { InjectionKey } from 'vue'

// Typed injection keys (used in App.vue provide, TheBricks + BrickCard inject)
export const defaultEnvKey: InjectionKey<string> = Symbol('defaultEnv')
export const defaultUrlKey: InjectionKey<string> = Symbol('defaultUrl')
export const searchstaxEndpointKey: InjectionKey<string> = Symbol('searchstaxEndpoint')
export const searchstaxTokenKey: InjectionKey<string> = Symbol('searchstaxToken')

export interface Brick {
  id: string
  inscription: string
  brickImage: string
  brickParkLocation: string
  isPlaceholderImage?: boolean
  brickImagePreviewUrl?: string
  brickImageFullUrl?: string
  parkLocationName?: string
  parkLocationImgURL?: string
}

export interface BrickApiItem {
  id: string
  attributes: { field_brick_inscription: string }
  relationships: {
    field_brick_image: { data: { id: string } | null }
    field_brick_zone: { data: { id: string } | null }
  }
}

export interface BrickApiResponse {
  data: BrickApiItem[]
  included?: Array<{
    type: string
    id: string
    attributes: {
      uri?: { value?: string; url?: string }
      image_style_uri?: ImageStyleUri
    }
  }>
  links: { next?: { href: string } }
  meta?: { count?: number }
}

export interface FileApiItem {
  id: string
  type?: string
  attributes?: {
    uri?: { value?: string; url?: string }
    image_style_uri?: ImageStyleUri
  }
}

// SearchStax response types
export interface SearchstaxDoc {
  ss_uuid: string
  ss_zone_uuid: string
  ss_file_img_uuid: string
  ss_body: string
  'tcngramm_X3b_en_description': string[]
  'tm_X3b_en_title': string[]
  its_fid: number
  its_id: number
}

export interface SearchstaxResponse {
  response: {
    numFound: number
    start: number
    docs: SearchstaxDoc[]
  }
}

export interface ParkLocation {
  id: string
  name: string
  mapImageUrl: string
}

export interface ParkLocationsApiResponse {
  data: Array<{
    id: string
    attributes: { name: string }
    relationships: {
      field_brick_zone_image?: { data: { type: string; id: string } | null }
    }
  }>
  included?: Array<{
    type: string
    id: string
    attributes: {
      uri?: { value?: string; url?: string }
      image_style_uri?: ImageStyleUri
      [key: string]: unknown
    }
    relationships?: {
      field_media_image?: { data: { type: string; id: string } | null }
    }
  }>
}

export interface ImageStyleUri {
  brick?: string
  brick_preview?: string
  brick_large?: string
  full_im?: string
  [key: string]: string | undefined
}

export interface MediaImageApiResponse {
  data?: FileApiItem
}

export interface ParkLocationApiResponse {
  data: {
    attributes: { name: string }
    relationships?: {
      field_brick_zone_image?: { data: { type: string; id: string } | null }
    }
  }
  included?: Array<{
    type: string
    id: string
    attributes: {
      uri?: { value?: string; url?: string }
      image_style_uri?: ImageStyleUri
    }
    relationships?: {
      field_media_image?: { data: { type: string; id: string } | null }
    }
  }>
}
