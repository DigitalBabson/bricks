<template>
  <form
    role="search"
    class="
      bricks__search-form
      tw-mx-auto tw-w-full tw-max-w-[700px]
      tw-bg-brickCourtyardGreen tw-px-8 sm:tw-px-12 tw-py-5
      tw-flex tw-flex-col tw-gap-4
    "
    @submit.prevent
  >
    <div class="tw-form-control tw-text-m">
      <label
        for="search-brick"
        class="tw-mb-2 tw-block tw-font-zilla tw-text-[18px] tw-font-normal tw-leading-normal tw-text-white"
      >
        Search by Brick Inscription
      </label>
      <input
        id="search-brick"
        class="tw-w-full tw-border tw-border-gray-300 tw-px-3 tw-py-1 tw-leading-8 tw-font-oswald"
        :value="inscription"
        type="text"
        @input="$emit('update:inscription', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div>
      <label
        id="locations-label"
        class="tw-mb-2 tw-block tw-font-zilla tw-text-[18px] tw-font-normal tw-leading-normal tw-text-white"
      >
        Brick Locations
      </label>
      <span id="locations-instructions" class="tw-sr-only">
        Use arrow keys to navigate options. Press Space to select or deselect.
      </span>
      <ul
        ref="locationListbox"
        role="listbox"
        aria-labelledby="locations-label"
        aria-describedby="locations-instructions"
        aria-multiselectable="true"
        :aria-activedescendant="activeDescendantId"
        tabindex="0"
        class="
          bricks__location-listbox
          tw-max-h-[84px] tw-overflow-y-scroll tw-bg-white
          focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-brickSummerNight
        "
        @keydown.arrow-down.prevent="moveActive(1)"
        @keydown.arrow-up.prevent="moveActive(-1)"
        @keydown.home.prevent="moveActiveToFirst"
        @keydown.end.prevent="moveActiveToLast"
        @keydown.enter.prevent="toggleActiveSelection"
        @keydown.space.prevent="toggleActiveSelection"
        @focus="onListboxFocus"
        @blur="onListboxBlur"
      >
        <li
          v-for="(location, index) in locations"
          :id="optionId(location.id)"
          :key="location.id"
          role="option"
          :aria-selected="locationIds.includes(location.id)"
          class="tw-cursor-pointer tw-px-3 tw-py-[4px] tw-font-oswald tw-text-[16px] tw-leading-normal"
          :class="optionClasses(location.id, index)"
          @click="selectLocation(location.id)"
        >
          {{ location.name }}
        </li>
      </ul>
    </div>

    <div>
      <div
        class="
          bricks__filter-actions
          tw-flex tw-min-h-[51px] tw-flex-wrap tw-items-center tw-gap-2
          tw-bg-[rgba(255,255,255,0.53)] tw-px-[0.8rem] tw-py-2
        "
      >
        <span
          v-for="filter in activeFilters"
          :key="`${filter.type}-${filter.value}`"
          class="
            tw-inline-flex tw-items-center tw-gap-3 tw-rounded-[23px]
            tw-bg-white tw-px-3 tw-py-1
            tw-font-oswald tw-text-sm tw-text-black
          "
        >
          {{ filter.label }}: {{ filter.value }}
          <button
            type="button"
            class="
              tw-relative tw-inline-flex tw-h-[15px] tw-w-[15px] tw-items-center tw-justify-center
              tw-rounded-full tw-bg-black tw-leading-none tw-text-white
              before:tw-absolute before:tw-inset-[-6px] before:tw-content-['']
            "
            :aria-label="`Remove ${filter.label}: ${filter.value}`"
            @click="removeFilter(filter.type, filter.locationId)"
          >
            <i class="fa-solid fa-xmark tw-text-[9px]"></i>
          </button>
        </span>

        <button
          class="
            tw-rounded-[23px] tw-px-3 tw-py-1
            tw-font-oswald tw-text-sm tw-font-normal
            tw-transition-colors tw-duration-200
          "
          :class="activeFilters.length === 0
            ? 'tw-bg-[#CCD8C0] tw-text-[#31451D] tw-cursor-not-allowed'
            : 'tw-bg-white tw-text-black hover:tw-bg-gray-100 tw-cursor-pointer'"
          :disabled="activeFilters.length === 0"
          type="button"
          @click="$emit('clearAll')"
        >
          Clear all
        </button>

      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { ParkLocation } from '../types/index'

type ActiveFilter = {
  type: 'inscription' | 'location'
  label: string
  value: string
  locationId?: string
}

export default defineComponent({
  props: {
    inscription: { type: String, required: true },
    locationIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    locations: {
      type: Array as PropType<ParkLocation[]>,
      default: () => [],
    },
  },
  emits: {
    'update:inscription': (value: string) => typeof value === 'string',
    'update:locationIds': (value: string[]) => Array.isArray(value),
    clearAll: () => true,
  },
  data() {
    return {
      activeIndex: -1,
      isListboxFocused: false,
    }
  },
  computed: {
    activeDescendantId(): string | undefined {
      if (this.activeIndex < 0 || this.activeIndex >= this.locations.length) {
        return undefined
      }

      return this.optionId(this.locations[this.activeIndex].id)
    },
    activeFilters(): ActiveFilter[] {
      const filters: ActiveFilter[] = []

      if (this.inscription) {
        filters.push({
          type: 'inscription',
          label: 'Brick Inscription',
          value: this.inscription,
        })
      }

      if (this.locationIds.length > 0) {
        const locationFilters = this.locationIds.map((locationId) => {
          const location = this.locations.find((item) => item.id === locationId)
          return {
            type: 'location' as const,
            label: 'Brick Location',
            value: location?.name ?? locationId,
            locationId,
          }
        })

        filters.push(...locationFilters)
      }

      return filters
    },
  },
  watch: {
    locationIds() {
      if (!this.locations.length) {
        this.activeIndex = -1
        return
      }

      const currentActiveId = this.locations[this.activeIndex]?.id
      if (currentActiveId && this.locationIds.includes(currentActiveId)) {
        return
      }

      const selectedIndex = this.locations.findIndex((location) => this.locationIds.includes(location.id))
      this.activeIndex = selectedIndex >= 0 ? selectedIndex : this.activeIndex
    },
    locations: {
      handler() {
        if (!this.locations.length) {
          this.activeIndex = -1
          return
        }

        if (this.activeIndex >= this.locations.length) {
          this.activeIndex = this.locations.length - 1
        }
      },
      deep: true,
    },
  },
  methods: {
    optionId(id: string): string {
      return `location-option-${id}`
    },
    optionClasses(id: string, index: number): string[] {
      const classes: string[] = []
      const isSelected = this.locationIds.includes(id)
      const isActive = index === this.activeIndex && this.isListboxFocused

      if (isSelected) {
        if (isActive) {
          classes.push('tw-bg-[rgb(179,215,255)]')
        } else {
          classes.push('tw-bg-[#CECECE]')
        }
      } else {
        classes.push('hover:tw-bg-gray-100')
      }

      if (isActive && !isSelected) {
        classes.push('tw-ring-2', 'tw-ring-inset', 'tw-ring-brickSummerNight')
      }

      return classes
    },
    selectLocation(id: string) {
      const listbox = this.$refs.locationListbox as HTMLElement | undefined
      if (listbox && document.activeElement !== listbox) {
        listbox.focus()
      }

      this.isListboxFocused = true
      const selectedIndex = this.locations.findIndex((location) => location.id === id)
      this.activeIndex = selectedIndex
      const newIds = this.locationIds.includes(id)
        ? this.locationIds.filter((locationId) => locationId !== id)
        : [...this.locationIds, id]
      this.$emit('update:locationIds', newIds)
    },
    removeFilter(type: ActiveFilter['type'], locationId?: string) {
      if (type === 'inscription') {
        this.$emit('update:inscription', '')
        return
      }

      if (!locationId) {
        this.$emit('update:locationIds', [])
        return
      }

      this.$emit(
        'update:locationIds',
        this.locationIds.filter((selectedLocationId) => selectedLocationId !== locationId),
      )
    },
    onListboxFocus() {
      this.isListboxFocused = true

      if (!this.locations.length) {
        return
      }

      if (this.activeIndex >= 0) {
        return
      }

      const selectedIndex = this.locations.findIndex((location) => this.locationIds.includes(location.id))
      this.activeIndex = selectedIndex >= 0 ? selectedIndex : 0
    },
    onListboxBlur() {
      this.isListboxFocused = false
    },
    moveActive(delta: number) {
      if (!this.locations.length) {
        return
      }

      if (this.activeIndex < 0) {
        this.activeIndex = delta > 0 ? 0 : this.locations.length - 1
      } else {
        let nextIndex = this.activeIndex + delta
        if (nextIndex < 0) {
          nextIndex = this.locations.length - 1
        }
        if (nextIndex >= this.locations.length) {
          nextIndex = 0
        }
        this.activeIndex = nextIndex
      }

      this.scrollActiveIntoView()
    },
    moveActiveToFirst() {
      if (!this.locations.length) {
        return
      }

      this.activeIndex = 0
      this.scrollActiveIntoView()
    },
    moveActiveToLast() {
      if (!this.locations.length) {
        return
      }

      this.activeIndex = this.locations.length - 1
      this.scrollActiveIntoView()
    },
    toggleActiveSelection() {
      if (this.activeIndex < 0 || this.activeIndex >= this.locations.length) {
        return
      }

      this.selectLocation(this.locations[this.activeIndex].id)
    },
    scrollActiveIntoView() {
      this.$nextTick(() => {
        const listbox = this.$refs.locationListbox as HTMLElement | undefined
        const activeElement = this.activeDescendantId
          ? listbox?.querySelector<HTMLElement>(`#${this.activeDescendantId}`)
          : undefined
        if (typeof activeElement?.scrollIntoView === 'function') {
          activeElement.scrollIntoView({ block: 'nearest' })
        }
      })
    },
  },
})
</script>

<style scoped>
@media (max-width: 1023px) {
  .bricks__location-listbox::-webkit-scrollbar {
    width: 8px;
  }
  .bricks__location-listbox::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .bricks__location-listbox::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
  }
  .bricks__location-listbox {
    scrollbar-width: thin;
  }
}
</style>
