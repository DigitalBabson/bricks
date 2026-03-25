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
        ref="dialogContainer"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        class="
          tw-relative tw-flex tw-w-[90vw] tw-max-h-[90vh] tw-flex-col
          tw-items-center tw-justify-center tw-shadow-xl
          md:tw-h-[80vh] md:tw-max-w-[1100px]
        "
      >
        <button
          ref="closeButton"
          class="
            tw-absolute tw-right-0 tw-top-[-60px] tw-z-30
            tw-flex tw-h-[56px] tw-w-[56px] tw-items-center tw-justify-center
            tw-rounded tw-text-white
            md:tw-right-[-66px] md:tw-top-[-66px]
            hover:tw-opacity-70 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-white
          "
          aria-label="Close modal"
          @click="$emit('close')"
        >
          <i class="fa-solid fa-xmark tw-text-4xl"></i>
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
import { lockBodyScroll, unlockBodyScroll } from '../composables/useBodyScrollLock'

export default defineComponent({
  props: {
    label: { type: String, default: 'Dialog' },
  },
  emits: ['close'],
  methods: {
    handleDocumentKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        this.$emit('close')
        return
      }
      if (event.key === 'Tab') {
        const container = this.$refs.dialogContainer as HTMLElement | undefined
        if (!container) return
        const focusable = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    },
  },
  mounted() {
    document.addEventListener('keydown', this.handleDocumentKeydown)
    lockBodyScroll()
    this.$nextTick(() => {
      (this.$refs.closeButton as HTMLElement)?.focus()
    })
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeydown)
    unlockBodyScroll()
  },
})
</script>
