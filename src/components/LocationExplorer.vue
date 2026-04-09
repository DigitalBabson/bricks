<template>
  <teleport to="body">
    <transition name="fade">
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
          aria-label="Location explorer"
          class="
            tw-relative tw-shadow-xl
            tw-w-[90vw] tw-max-h-[90vh]
            md:tw-max-w-[1100px] md:tw-h-[80vh]
            md:tw-rounded-lg
            tw-flex tw-flex-col
          "
        >
          <!-- Close button: fixed top-right on mobile, image-relative on desktop -->
          <button
            ref="closeButton"
            class="
              tw-absolute tw-z-30 tw-right-0 tw-top-[-60px]
              tw-w-[56px] tw-h-[56px]
              tw-flex tw-items-center tw-justify-center
              tw-rounded tw-text-white tw-leading-none
              min-[1250px]:tw-right-[-66px] min-[1250px]:tw-top-[-66px]
              hover:tw-opacity-70 focus-visible:tw-outline-none
              focus-visible:tw-ring-2 focus-visible:tw-ring-white
            "
            aria-label="Close location explorer"
            @click="$emit('close')"
          >
            <i class="fa-solid fa-xmark tw-text-4xl"></i>
          </button>

          <!-- Content: mobile stacked + centered, desktop image-fill with list overlaid -->
          <div class="tw-flex tw-flex-col tw-flex-1 tw-min-h-0 md:tw-relative tw-overflow-hidden">
            <!-- Map image: mobile stacked block / desktop fills container -->
            <div
              ref="imageContainer"
              class="
                tw-order-1
                tw-flex-shrink-0
                md:tw-absolute md:tw-inset-0 md:tw-h-auto
                tw-flex tw-items-center tw-justify-center md:tw-p-0
              "
            >
              <img
                v-if="selectedLocation?.mapImageUrl"
                ref="mapImage"
                :src="selectedLocation.mapImageUrl"
                :alt="`Map of ${selectedLocation.name}`"
                class="tw-max-w-full tw-max-h-[45vh] md:tw-max-h-full md:tw-w-full md:tw-h-full tw-object-contain"
                @load="updateNavHeight"
              />
              <p
                v-else
                class="tw-font-oswald tw-text-[16px] tw-leading-6 tw-tracking-[0.08em] tw-text-white"
              >
                No map available for this location.
              </p>
            </div>

            <!-- Location list: mobile below image (same width), desktop overlaid on image -->
            <nav
              class="
                tw-order-2 tw-min-h-0
                tw-mx-auto md:tw-mx-0
                md:tw-absolute
                tw-bg-white md:tw-bg-white/85
                tw-flex tw-flex-col tw-z-20
              "
              :style="navOverlayStyle"
              aria-label="Park locations"
            >
              <!-- Heading -->
              <div class="tw-px-4 tw-py-3 tw-text-center tw-font-oswald tw-text-[16px] tw-font-normal tw-uppercase tw-tracking-[0.5px] tw-text-black" style="background-color: #EEF1DC;">
                Brick Location
              </div>

              <!-- Up chevron -->
              <div
                class="
                  tw-sticky tw-top-0 tw-z-10
                  tw-flex tw-justify-center tw-py-1
                  tw-bg-gradient-to-b tw-from-white/85 tw-to-transparent
                "
              >
                <button
                  type="button"
                  class="tw-text-black tw-text-lg tw-transition-opacity"
                  :class="showUpChevron ? '' : 'tw-opacity-20 tw-cursor-default'"
                  :disabled="!showUpChevron"
                  aria-label="Scroll locations up"
                  @click="scrollLocations('up')"
                >
                  <i class="fa-regular fa-angle-up"></i>
                </button>
              </div>

              <!-- role="listbox" gives screen readers the right widget semantics.
                   Each option has tabindex="0" (non-standard roving tabindex)
                   so Tab navigates through items individually per user requirement,
                   while role="option" + aria-selected provide selection announcements. -->
              <ul
                ref="locationList"
                role="listbox"
                aria-label="Park locations"
                class="tw-flex-1 tw-overflow-y-auto tw-text-center location-list"
                @scroll="updateChevrons"
              >
                <li
                  v-for="(loc, index) in locations"
                  :id="optionId(loc.id)"
                  :key="loc.id"
                  role="option"
                  :aria-selected="loc.id === selectedZoneId"
                  tabindex="0"
                  class="
                    location-item
                    tw-px-2 tw-py-2 tw-cursor-pointer
                    tw-font-oswald tw-font-light tw-text-[16px] tw-leading-6
                    tw-tracking-[0.5px] tw-text-black tw-text-center
                    tw-transition-colors tw-duration-150
                  "
                  :class="loc.id === selectedZoneId ? 'tw-font-medium' : 'hover:tw-bg-black/5'"
                  @click="selectLocation(loc.id)"
                  @focus="onItemFocus(loc.id, index)"
                  @keydown.arrow-down.prevent="focusAdjacentItem(index, 1)"
                  @keydown.arrow-up.prevent="focusAdjacentItem(index, -1)"
                >
                  {{ loc.name }}
                </li>
              </ul>

              <!-- Down chevron -->
              <div
                class="
                  tw-sticky tw-bottom-0 tw-z-10
                  tw-flex tw-justify-center tw-py-1
                  tw-bg-gradient-to-t tw-from-white/85 tw-to-transparent
                "
              >
                <button
                  type="button"
                  class="tw-text-black tw-text-lg tw-transition-opacity"
                  :class="showDownChevron ? '' : 'tw-opacity-20 tw-cursor-default'"
                  :disabled="!showDownChevron"
                  aria-label="Scroll locations down"
                  @click="scrollLocations('down')"
                >
                  <i class="fa-regular fa-angle-down"></i>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { ParkLocation } from '../types/index'
import { lockBodyScroll, unlockBodyScroll } from '../composables/useBodyScrollLock'

export default defineComponent({
  props: {
    locations: {
      type: Array as PropType<ParkLocation[]>,
      required: true,
    },
  },
  emits: ['close'],
  data() {
    return {
      selectedZoneId: '',
      showUpChevron: false,
      showDownChevron: true,
      imageRenderedTop: 0,
      imageRenderedHeight: 0,
      imageRenderedLeft: 0,
      imageRenderedWidth: 0,
      isMobile: false,
    }
  },
  computed: {
    selectedLocation(): ParkLocation | undefined {
      return this.locations.find((loc) => loc.id === this.selectedZoneId)
    },
    navOverlayStyle(): Record<string, string> {
      if (this.isMobile) {
        // Mobile: match the rendered image width, centered
        if (!this.imageRenderedWidth) return {}
        return {
          width: `${this.imageRenderedWidth}px`,
          maxHeight: '40vh',
        }
      }
      // Desktop: overlaid on the image
      if (!this.imageRenderedHeight) return {}
      return {
        top: `${this.imageRenderedTop}px`,
        left: `${this.imageRenderedLeft + 10}px`,
        width: '180px',
        maxHeight: `${this.imageRenderedHeight - 20}px`,
      }
    },
  },
  watch: {
    locations: {
      handler(newVal: ParkLocation[]) {
        if (newVal.length && !this.selectedZoneId) {
          this.selectedZoneId = newVal[0].id
        }
        this.$nextTick(() => this.updateChevrons())
      },
      immediate: true,
    },
  },
  mounted() {
    document.addEventListener('keydown', this.onKeydown)
    lockBodyScroll()
    this.checkMobile()
    this.$nextTick(() => {
      this.updateChevrons()
      ;(this.$refs.closeButton as HTMLElement)?.focus()
    })
    window.addEventListener('resize', this.updateChevrons)
    window.addEventListener('resize', this.updateNavHeight)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKeydown)
    unlockBodyScroll()
    window.removeEventListener('resize', this.updateChevrons)
    window.removeEventListener('resize', this.updateNavHeight)
  },
  methods: {
    optionId(id: string): string {
      return `location-explorer-option-${id}`
    },
    selectLocation(id: string) {
      this.selectedZoneId = id
    },
    onItemFocus(id: string, index: number) {
      this.selectedZoneId = id
      // Scroll item into view if it's being reached via Tab
      this.$nextTick(() => {
        const list = this.$refs.locationList as HTMLElement | undefined
        const el = list?.querySelector<HTMLElement>(`[id="${this.optionId(id)}"]`)
        el?.scrollIntoView?.({ block: 'nearest' })
      })
    },
    focusAdjacentItem(currentIndex: number, delta: number) {
      const nextIndex = currentIndex + delta
      if (nextIndex < 0 || nextIndex >= this.locations.length) return
      const list = this.$refs.locationList as HTMLElement | undefined
      const el = list?.querySelector<HTMLElement>(`[id="${this.optionId(this.locations[nextIndex].id)}"]`)
      el?.focus()
    },
    onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        this.$emit('close')
        return
      }
      // Focus trap: constrain Tab within the dialog
      if (e.key === 'Tab') {
        const container = this.$refs.dialogContainer as HTMLElement | undefined
        if (!container) return
        const focusable = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768
    },
    updateNavHeight() {
      this.checkMobile()
      const img = this.$refs.mapImage as HTMLImageElement | undefined
      if (!img) {
        this.imageRenderedTop = 0
        this.imageRenderedHeight = 0
        this.imageRenderedLeft = 0
        this.imageRenderedWidth = 0
        return
      }

      if (this.isMobile) {
        // Mobile: image is rendered inline, measure its actual size
        this.imageRenderedWidth = img.clientWidth
        return
      }

      // Desktop: object-contain centers the image — compute rendered dimensions
      const container = img.parentElement
      if (!container) return
      const containerRect = container.getBoundingClientRect()
      const naturalW = img.naturalWidth || 1
      const naturalH = img.naturalHeight || 1
      const scale = Math.min(containerRect.width / naturalW, containerRect.height / naturalH)
      const renderedW = naturalW * scale
      const renderedH = naturalH * scale
      // The image is centered by flexbox — compute offsets
      const offsetTop = (containerRect.height - renderedH) / 2
      const offsetRight = (containerRect.width - renderedW) / 2
      this.imageRenderedTop = offsetTop
      this.imageRenderedHeight = renderedH
      this.imageRenderedLeft = offsetRight
      this.imageRenderedWidth = renderedW
      this.$nextTick(() => this.updateChevrons())
    },
    updateChevrons() {
      const list = this.$refs.locationList as HTMLElement | undefined
      if (!list) return
      this.showUpChevron = list.scrollTop > 0
      this.showDownChevron =
        list.scrollTop + list.clientHeight < list.scrollHeight - 1
    },
    scrollLocations(direction: 'up' | 'down') {
      const list = this.$refs.locationList as HTMLElement | undefined
      if (!list) return
      const amount = Math.max(44, Math.round(list.clientHeight * 0.35))
      list.scrollBy({
        top: direction === 'up' ? -amount : amount,
        behavior: 'smooth',
      })
    },
  },
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style scoped>
.location-item {
  position: relative;
}
.location-item:focus-visible {
  outline-offset: -2px;
  box-shadow: none;
}
.location-item:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 1px;
  background: rgba(0, 0, 0, 0.15);
}
.location-list {
  scrollbar-width: none;
}
.location-list::-webkit-scrollbar {
  display: none;
}
</style>
