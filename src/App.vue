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
      />
    </div>
  </main>
  <location-explorer-trigger
    class="md:tw-hidden"
    :floating="true"
    @openLocations="showLocationExplorer = true"
  />
  <app-footer />
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
import { defaultUrlKey } from './types/index'
import type { ParkLocation, ParkLocationsApiResponse } from './types/index'

export default defineComponent({
  components: {
    TheBricks,
    AppHeader,
    AppHero,
    AppFooter,
    BrickFilter,
    LocationExplorerTrigger,
  },
  inject: {
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
  },
  methods: {
    clearAllFilters() {
      this.inscription = ''
      this.locationIds = []
    },
    async fetchLocations() {
      try {
        const url = `${this.apiUrl}parkLocations?fields[parkLocation]=name&include=brick_zone_image&sort=name`
        const response = await axios.get<ParkLocationsApiResponse>(url)
        const included = response.data.included ?? []

        this.locations = response.data.data.map((location) => {
          const imageRelId = location.relationships.brick_zone_image?.data?.id
          const imageEntity = included.find((item) => item.id === imageRelId)

          return {
            id: location.id,
            name: location.attributes.name,
            mapImageUrl: imageEntity?.attributes.image_style_uri?.full_img ?? '',
          }
        })
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
