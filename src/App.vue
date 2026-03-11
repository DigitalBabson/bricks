<template>
<div class="tw-flex tw-min-h-screen tw-w-full tw-flex-col">
  <app-header />
  <main class="tw-flex-1">
    <app-hero @openLocations="showLocationExplorer = true">
      <brick-filter v-model:inscription="inscription" />
    </app-hero>
    <div class="tw-pb-brick40 md:tw-pb-brick60 lg:tw-pb-brick80">
      <the-bricks :inscription="inscription" />
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
import TheBricks from './components/TheBricks.vue'
import AppHeader from './components/AppHeader.vue'
import AppHero from './components/AppHero.vue'
import AppFooter from './components/AppFooter.vue'
import BrickFilter from './components/BrickFilter.vue'
import LocationExplorerTrigger from './components/LocationExplorerTrigger.vue'

export default defineComponent({
  components: {
    TheBricks,
    AppHeader,
    AppHero,
    AppFooter,
    BrickFilter,
    LocationExplorerTrigger,
  },
  data() {
    return {
      showLocationExplorer: false,
      inscription: '',
    }
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
