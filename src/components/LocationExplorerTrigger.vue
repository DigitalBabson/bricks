<template>
  <button
    class="
      tw-bg-[#EEAF00] tw-text-[#1a1a1a] tw-font-oswald tw-text-[14px] tw-font-normal tw-uppercase
      hover:tw-bg-[#FFC42E] hover:tw-text-[#006644]
      focus-visible:tw-bg-[#FFC42E] focus-visible:tw-text-[#006644]
      location-trigger
      tw-transition-colors tw-duration-200
    "
    :class="buttonClasses"
    @click="$emit('openLocations')"
  >
    View Brick Locations
  </button>
</template>

<style scoped>
/* Use T4 CSS variables for hover so the button matches Babson's design system */
.location-trigger:hover,
.location-trigger:focus-visible {
  color: var(--white, #fff);
  background-color: var(--ocre-dark, #8E7200);
}
</style>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  props: {
    floating: { type: Boolean, default: false },
  },
  emits: ['openLocations'],
  setup(props) {
    const buttonClasses = computed(() =>
      props.floating
        ? 'tw-fixed tw-bottom-0 tw-right-0 tw-z-50 tw-rounded-none tw-shadow-brickCard tw-px-[16px] tw-py-[12px] focus-visible:tw-shadow-[0_0_0_6px_#fff]'
        : 'tw-px-[15px] tw-py-[12px]',
    )

    return {
      buttonClasses,
    }
  },
})
</script>
