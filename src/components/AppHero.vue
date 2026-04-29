<template>
  <div class="tw-w-full min-[700px]:tw-mb-[60px]">
    <section
      class="
        tw-hidden min-[700px]:tw-block
        tw-relative tw-w-full tw-h-[276px] tw-bg-cover tw-bg-center
      "
      :style="{ backgroundImage: `url(${heroImage})` }"
    >
      <!-- Full-coverage semi-transparent overlay -->
      <div class="tw-absolute tw-inset-0 tw-bg-white/80"></div>

      <!-- Desktop trigger: flush to viewport edge, anchored to content at 3xl -->
      <location-explorer-trigger
        class="
          tw-hidden lg:tw-block
          tw-absolute tw-top-12 tw-z-10
          tw-right-0
        "
        @openLocations="$emit('openLocations')"
      />
    </section>

    <div class="tw-relative tw-mx-auto tw-max-w-brickMWL min-[700px]:-tw-mt-[245px] min-[700px]:tw-px-6">
      <h1>Find My Brick</h1>
      <div class="tw-mx-auto tw-w-full tw-max-w-[700px]">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LocationExplorerTrigger from './LocationExplorerTrigger.vue'

export default defineComponent({
  components: {
    LocationExplorerTrigger,
  },
  emits: ['openLocations'],
  computed: {
    heroImage(): string {
      return import.meta.env.DEV_HERO_IMAGE || ''
    },
  },
})
</script>

<style scoped>
h1 {
  font-size: 3.2rem;
  margin-bottom: 1.8rem;
  margin-left: 0;
  margin-right: 0;
}
@media screen and (min-width: 40em) {
  h1 {
    font-size: 3.8rem;
    margin-bottom: 1.8rem;
  }
}
@media screen and (min-width: 64em) {
  h1 {
    font-size: 5rem;
    margin-top: 3.6rem;
    margin-bottom: 1.8rem;
    margin-left: 8rem;
  }
}
</style>
