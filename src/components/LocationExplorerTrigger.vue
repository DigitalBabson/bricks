<template>
  <button
    class="
      tw-bg-[#EEAF00] tw-text-[#1a1a1a] tw-font-oswald tw-text-[14px] tw-font-normal tw-uppercase
      hover:tw-opacity-95
      tw-transition-colors tw-duration-200
    "
    :class="buttonClasses"
    @click="$emit('openLocations')"
  >
    View Brick Locations
  </button>
</template>

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
        ? 'tw-fixed tw-bottom-0 tw-right-0 tw-z-50 tw-rounded-none tw-shadow-brickCard tw-px-4 tw-py-3'
        : 'tw-px-6 tw-py-3',
    )

    return {
      buttonClasses,
    }
  },
})
</script>
