<template>
  <div class="tw-w-full lg:tw-mb-[60px]">
    <section
      class="
        tw-relative tw-w-full tw-h-[355px] tw-bg-cover tw-bg-center md:tw-h-[355px]
        lg:tw-h-[276px]
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
      </div>
    </section>

    <div class="tw-relative tw-mx-auto tw-max-w-brickMWL -tw-mt-[355px] md:-tw-mt-[355px] md:tw-px-6 lg:-tw-mt-[245px]">
      <div class="tw-mx-auto tw-h-[355px] tw-w-full tw-max-w-[700px] md:tw-min-h-[310px] lg:tw-h-auto">
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
