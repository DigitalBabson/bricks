<template>
  <section
    class="
      tw-relative tw-w-full tw-h-[355px] tw-bg-cover tw-bg-center md:tw-h-auto md:tw-min-h-[350px]
      lg:tw-h-[276px] lg:tw-min-h-0 lg:tw-overflow-visible lg:tw-mb-[140px]
    "
    :style="{ backgroundImage: `url(${heroImage})` }"
  >
    <!-- Full-coverage semi-transparent overlay -->
    <div class="tw-absolute tw-inset-0 tw-bg-white/80"></div>

    <div class="tw-relative tw-h-full tw-max-w-brickMWL tw-mx-auto md:tw-px-6 md:tw-py-10 lg:tw-h-full">
      <location-explorer-trigger
        class="
          tw-hidden md:tw-block
          tw-absolute tw-top-12 tw-right-6
        "
        @openLocations="$emit('openLocations')"
      />

      <div class="tw-h-full lg:tw-absolute lg:tw-left-1/2 lg:-tw-bottom-[70px] lg:tw-w-full lg:tw-max-w-[576px] lg:-tw-translate-x-1/2">
        <slot />
      </div>
    </div>
  </section>
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
