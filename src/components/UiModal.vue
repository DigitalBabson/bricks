<template>
  <div
    class="
      tw-fixed tw-inset-0 tw-z-[90]
      tw-flex tw-items-center tw-justify-center
      tw-bg-black/[0.87]
    "
    @pointerdown="backdropClose.onPointerdown"
    @click="backdropClose.onClick"
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
          tw-fixed tw-top-2 tw-right-2 tw-z-[95]
          tw-flex tw-h-[56px] tw-w-[56px] tw-items-center tw-justify-center
          tw-rounded tw-text-white
          min-[1250px]:tw-absolute min-[1250px]:tw-top-[-66px] min-[1250px]:tw-right-[-66px]
          hover:tw-opacity-70 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-white
        "
        aria-label="Close modal"
        @click="$emit('close')"
      >
        <i class="fa-solid fa-xmark tw-text-4xl"></i>
      </button>
      <div
        ref="contentWrapper"
        class="tw-flex tw-max-h-full tw-w-full tw-items-center tw-justify-center tw-overflow-hidden"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { lockBodyScroll, unlockBodyScroll } from '../composables/useBodyScrollLock'
import { createBackdropClose } from '../composables/useBackdropClose'

export default defineComponent({
  props: {
    label: { type: String, default: 'Dialog' },
    // When provided, on close we focus the element matching this selector instead of
    // the opener. Use for modals where the natural next focus target isn't the trigger
    // (e.g. Brick Location modal → filter input).
    returnFocusSelector: { type: String, default: '' },
  },
  emits: ['close'],
  data() {
    return {
      previouslyFocused: null as HTMLElement | null,
      lastTabWasShift: false,
      backdropClose: createBackdropClose(
        (event) => this.isOutsideContent(event.target),
        () => this.$emit('close'),
      ),
    }
  },
  methods: {
    // The dialog container and content wrapper are transparent layout boxes that
    // fill most of the screen, so clicks on the visible backdrop usually land on
    // them rather than on the backdrop itself. Treat all three as "outside".
    isOutsideContent(target: EventTarget | null) {
      return (
        target === this.$el ||
        target === this.$refs.dialogContainer ||
        target === this.$refs.contentWrapper
      )
    },
    handleDocumentKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        this.$emit('close')
        return
      }
      // Focus trap: cycle Tab ourselves over the dialog's controls. Which elements
      // native Tab visits is up to the browser (Safari and macOS Firefox skip
      // <button>s by default), so checking only "is this the last control?" lets
      // focus walk out to the page behind the overlay.
      if (event.key === 'Tab') {
        this.lastTabWasShift = event.shiftKey
        event.preventDefault()
        const focusable = this.getFocusable()
        if (!focusable.length) return
        const index = focusable.indexOf(document.activeElement as HTMLElement)
        const last = focusable.length - 1
        const next = event.shiftKey
          ? (index <= 0 ? last : index - 1)
          : (index === -1 || index === last ? 0 : index + 1)
        focusable[next].focus()
      }
    },
    getFocusable(): HTMLElement[] {
      const container = this.$refs.dialogContainer as HTMLElement | undefined
      if (!container) return []
      return Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
    },
    // Backstop for focus that lands outside the dialog without a Tab keydown
    // (e.g. assistive-tech navigation).
    handleDocumentFocusin(event: FocusEvent) {
      const container = this.$refs.dialogContainer as HTMLElement | undefined
      if (!container || !(event.target instanceof Node) || container.contains(event.target)) return
      const focusable = this.getFocusable()
      if (!focusable.length) return
      ;(this.lastTabWasShift ? focusable[focusable.length - 1] : focusable[0]).focus()
    },
  },
  mounted() {
    // Remember what was focused before the modal opened so we can restore
    // focus to it on close — keeps Tab order continuous from the opener.
    this.previouslyFocused = (document.activeElement as HTMLElement) || null
    document.addEventListener('keydown', this.handleDocumentKeydown)
    document.addEventListener('focusin', this.handleDocumentFocusin)
    lockBodyScroll()
    this.$nextTick(() => {
      (this.$refs.closeButton as HTMLElement)?.focus()
    })
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeydown)
    document.removeEventListener('focusin', this.handleDocumentFocusin)
    unlockBodyScroll()
    const override = this.returnFocusSelector
      ? document.querySelector<HTMLElement>(this.returnFocusSelector)
      : null
    const target = override ?? this.previouslyFocused
    if (target && typeof target.focus === 'function' && document.body.contains(target)) {
      target.focus()
    }
    this.previouslyFocused = null
  },
})
</script>
