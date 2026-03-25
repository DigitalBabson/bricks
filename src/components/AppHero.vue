<template>
  <div class="tw-w-full min-[700px]:tw-mb-[60px]">
    <section
      class="
        tw-relative tw-w-full tw-h-[355px] tw-bg-cover tw-bg-center
        min-[700px]:tw-h-[276px]
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

    <div class="tw-relative tw-mx-auto tw-max-w-brickMWL -tw-mt-[355px] min-[700px]:-tw-mt-[245px] min-[700px]:tw-px-6">
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
