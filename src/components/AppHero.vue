<template>
  <section
    class="tw-relative tw-w-full tw-bg-cover tw-bg-center tw-min-h-[250px] md:tw-min-h-[350px]"
    :style="{ backgroundImage: `url(${heroImage})` }"
  >
    <!-- Full-coverage semi-transparent overlay -->
    <div class="tw-absolute tw-inset-0 tw-bg-white/80"></div>

    <div class="tw-relative tw-max-w-brickMWL tw-mx-auto tw-px-6 tw-py-8 md:tw-py-10">
      <location-explorer-trigger
        class="
          tw-hidden md:tw-block
          tw-absolute tw-top-12 tw-right-6
        "
        @openLocations="$emit('openLocations')"
      />

      <!-- Search form slot -->
      <slot />
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
