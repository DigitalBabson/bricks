<template>
  <teleport to="body">
    <div
      class="
        tw-fixed tw-inset-0 tw-z-50
        tw-flex tw-items-center tw-justify-center
        tw-bg-black/[0.87]
      "
      @click.self="$emit('close')"
    >
      <div
        role="dialog"
        aria-modal="true"
        class="
          tw-relative tw-flex tw-w-[90vw] tw-max-h-[90vh] tw-flex-col
          tw-items-center tw-justify-center tw-shadow-xl
          md:tw-h-[80vh] md:tw-max-w-[1100px]
        "
      >
        <button
          class="
            tw-absolute tw-right-0 tw-top-[-60px] tw-z-30
            tw-flex tw-h-[56px] tw-w-[56px] tw-items-center tw-justify-center
            tw-rounded tw-text-white
            md:tw-right-[-66px] md:tw-top-[-66px]
            hover:tw-opacity-70 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-white
          "
          aria-label="Close modal"
          @click="$emit('close')"
        >
          <span class="tw-text-5xl tw-font-light tw-leading-none">&times;</span>
        </button>
        <div class="tw-flex tw-max-h-full tw-w-full tw-items-center tw-justify-center tw-overflow-hidden">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  emits: ["close"],
  methods: {
    handleDocumentKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        this.$emit('close')
      }
    },
  },
  mounted() {
    document.addEventListener('keydown', this.handleDocumentKeydown)
    document.body.style.overflow = 'hidden'
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeydown)
    document.body.style.overflow = ''
  },
})
</script>
