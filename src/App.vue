<template>
<div class="tw-flex tw-min-h-screen tw-w-full tw-flex-col">
  <app-header />
  <main class="tw-flex-1">
    <app-hero @openLocations="showLocationExplorer = true">
      <brick-filter
        v-model:inscription="inscription"
        v-model:locationIds="locationIds"
        :locations="locations"
        @clearAll="clearAllFilters"
      />
    </app-hero>
    <div class="tw-pt-8 md:tw-pt-0 tw-pb-brick40 md:tw-pb-brick60 lg:tw-pb-brick80">
      <the-bricks
        :inscription="inscription"
        :locationIds="locationIds"
        :locations="locations"
      />
    </div>
  </main>
  <location-explorer-trigger
    class="md:tw-hidden"
    :floating="true"
    @openLocations="showLocationExplorer = true"
  />
  <app-footer />
  <location-explorer
    v-if="showLocationExplorer"
    :locations="locations"
    @close="showLocationExplorer = false"
  />
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import TheBricks from './components/TheBricks.vue'
import AppHeader from './components/AppHeader.vue'
import AppHero from './components/AppHero.vue'
import AppFooter from './components/AppFooter.vue'
import BrickFilter from './components/BrickFilter.vue'
import LocationExplorerTrigger from './components/LocationExplorerTrigger.vue'
import LocationExplorer from './components/LocationExplorer.vue'
import { defaultEnvKey, defaultUrlKey } from './types/index'
import type { ParkLocation, ParkLocationsApiResponse } from './types/index'

export default defineComponent({
  components: {
    TheBricks,
    AppHeader,
    AppHero,
    AppFooter,
    BrickFilter,
    LocationExplorerTrigger,
    LocationExplorer,
  },
  inject: {
    defaultEnv: { from: defaultEnvKey, default: '' },
    defaultUrl: { from: defaultUrlKey, default: '' },
  },
  data() {
    return {
      showLocationExplorer: false,
      inscription: '',
      locationIds: [] as string[],
      locations: [] as ParkLocation[],
    }
  },
  computed: {
    apiUrl(): string {
      return this.defaultUrl as string
    },
    apiBaseOrigin(): string {
      return this.defaultEnv as string
    },
  },
  methods: {
    resolveAssetUrl(url?: string): string {
      if (!url) {
        return ''
      }

      if (url.startsWith('http')) {
        return url
      }

      return `${this.apiBaseOrigin}${url}`
    },
    clearAllFilters() {
      this.inscription = ''
      this.locationIds = []
    },
    async fetchLocations() {
      try {
        const url =
          `${this.apiUrl}parkLocations` +
          `?include=field_brick_zone_image,field_brick_zone_image.field_media_image` +
          `&fields[parkLocation]=name,field_brick_zone_image` +
          `&fields[media--image]=field_media_image` +
          `&fields[file--file]=uri,url,image_style_uri` +
          `&sort=name`
        const response = await axios.get<ParkLocationsApiResponse>(url)
        const included = response.data.included ?? []

        const mapped = response.data.data.map((location) => {
          // Traverse: location → media → file → uri.url
          const mediaId = location.relationships.field_brick_zone_image?.data?.id
          const media = mediaId
            ? included.find((item) => item.id === mediaId && item.type === 'media--image')
            : undefined
          const fileId = media?.relationships?.field_media_image?.data?.id
          const file = fileId
            ? included.find((item) => item.id === fileId && item.type === 'file--file')
            : undefined
          const imagePath =
            file?.attributes?.image_style_uri?.brick_large ??
            file?.attributes?.image_style_uri?.full_img ??
            file?.attributes?.uri?.url ??
            ''

          return {
            id: location.id,
            name: location.attributes.name,
            mapImageUrl: this.resolveAssetUrl(imagePath),
          }
        })

        // Natural sort: numbered names (e.g. "1-2-3") first, then alphabetical
        const startsWithDigit = (s: string) => /^\d/.test(s)
        mapped.sort((a, b) => {
          const aNum = startsWithDigit(a.name)
          const bNum = startsWithDigit(b.name)
          // Numbered locations come first
          if (aNum && !bNum) return -1
          if (!aNum && bNum) return 1
          // Within each group, use locale-aware numeric comparison
          return a.name.localeCompare(b.name, undefined, { numeric: true })
        })

        this.locations = mapped
      } catch {
        this.locations = []
      }
    },
  },
  mounted() {
    this.fetchLocations()
  },
})
</script>

<style>
// @todo: can we remove this?
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
