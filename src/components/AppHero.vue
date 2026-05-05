<template>
  <div class="tw-w-full min-[700px]:tw-mb-[60px]">
    <section
      class="
        tw-hidden min-[700px]:tw-block
        tw-relative tw-w-full tw-h-[276px] tw-bg-cover tw-bg-center
      "
      :style="{ backgroundImage: `url(${heroImage})` }"
    >
      <!-- Full-coverage semi-transparent overlay -->
      <div class="tw-absolute tw-inset-0 tw-bg-white/80"></div>

      <!-- Breadcrumbs: sourced from #t4-breadcrumbs div rendered by T4 navigation layout -->
      <nav v-if="breadcrumbsHtml" aria-label="Breadcrumb"
        class="tw-absolute tw-top-3 tw-left-0 tw-z-10 tw-w-full tw-px-6"
      >
        <div
          class="tw-max-w-brickMWL tw-mx-auto tw-text-sm tw-font-zilla tw-text-brickBabsonGrey"
          v-html="breadcrumbsHtml"
        />
      </nav>

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

    <div class="tw-relative tw-mx-auto tw-max-w-brickMWL min-[700px]:-tw-mt-[245px] min-[700px]:tw-px-6">
      <h1 id="page-main-content">{{ headerText }}</h1>
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
  data() {
    return {
      breadcrumbsHtml: '',
      headerText: 'Find My Brick',
    }
  },
  computed: {
    heroImage(): string {
      return import.meta.env.DEV_HERO_IMAGE || ''
    },
  },
  mounted() {
    const breadcrumbs = document.querySelector<HTMLElement>('.c-breadcrumbs--default')
    this.breadcrumbsHtml = breadcrumbs?.outerHTML ?? ''
    if (breadcrumbs) breadcrumbs.style.display = 'none'

    const header = document.querySelector<HTMLElement>('h1.type__header--1')
    if (header) {
      this.headerText = header.textContent?.trim() ?? this.headerText
      // Hide from both view and assistive tech — skip-link now targets our visible h1#page-main-content
      header.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);'
      header.setAttribute('aria-hidden', 'true')
      header.removeAttribute('id')
    }
  },
})
</script>

<style scoped>
/* Fallback breadcrumb styles for dev preview.
   In production, Babson's global CSS provides .c-breadcrumbs styling. */
:deep(.c-breadcrumbs ul) {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
}
:deep(.c-breadcrumbs li) {
  font-family: 'Zilla Slab', serif;
  font-size: 14px !important;
  color: #464646;
}
:deep(.c-breadcrumbs li + li::before) {
  content: '/';
  margin-right: 0.25rem;
  color: #464646;
}
:deep(.c-breadcrumbs a) {
  color: #464646;
  text-decoration: none;
}
:deep(.c-breadcrumbs a:hover) {
  text-decoration: underline;
}

h1 {
  font-size: 3.2rem;
  margin-top: 0 !important; /* beats T4's #page-main-content { margin-top: -11rem } */
  padding-top: 0 !important; /* beats T4's #page-main-content { padding-top: 11rem } */
  margin-bottom: 1.8rem;
  margin-left: 0;
  margin-right: 0;
}
@media screen and (min-width: 40em) {
  h1 {
    font-size: 3.8rem;
    margin-bottom: 1.8rem;
  }
}
@media screen and (min-width: 64em) {
  h1 {
    font-size: 5rem;
    margin-top: 3.6rem !important;
    margin-bottom: 1.8rem;
    margin-left: 8rem;
  }
}
</style>
