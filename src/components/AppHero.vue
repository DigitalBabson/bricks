<template>
  <div class="tw-relative tw-w-full min-[700px]:tw-mb-[60px]">
    <section
      class="
        tw-hidden min-[700px]:tw-block
        tw-relative tw-w-full tw-h-[276px] tw-bg-cover tw-bg-center
      "
      :style="{ backgroundImage: `url(${heroImage})` }"
    >
      <!-- Full-coverage semi-transparent overlay -->
      <div class="tw-absolute tw-inset-0 tw-bg-white/80"></div>
    </section>

    <!-- Breadcrumbs: rendered here (not inside section) so the nav persists across breakpoints -->
    <nav v-if="breadcrumbsHtml" aria-label="Breadcrumb"
      class="tw-hidden min-[700px]:tw-block tw-w-full min-[700px]:tw-absolute min-[700px]:tw-top-3 min-[700px]:tw-left-0 min-[700px]:tw-z-10"
    >
      <div
        class="tw-mx-auto tw-text-sm tw-font-zilla tw-text-brickBabsonGrey"
        v-html="breadcrumbsHtml"
      />
    </nav>

    <!-- Desktop trigger: placed after breadcrumbs in DOM so tab order is breadcrumbs → trigger -->
    <location-explorer-trigger
      class="
        tw-hidden lg:tw-block
        tw-absolute tw-top-12 tw-z-10
        tw-right-0
      "
      @openLocations="$emit('openLocations')"
    />

    <!-- Floating (tablet/mobile) trigger: rendered here too so it tabs immediately after
         breadcrumbs on every viewport, matching the desktop ordering. -->
    <location-explorer-trigger
      class="lg:tw-hidden"
      :floating="true"
      @openLocations="$emit('openLocations')"
    />

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
  beforeUnmount() {
    ;(this as any)._breadcrumbCleanup?.()
  },
  mounted() {
    let injectedStyle: HTMLStyleElement | null = null
    let headObserver: MutationObserver | null = null
    let breadcrumbsObserver: MutationObserver | null = null
    let markedEls: HTMLElement[] = []
    type StyleSnapshot = { el: HTMLElement; position: string; positionPri: string; marginTop: string; marginTopPri: string }
    let t4Snapshot: StyleSnapshot[] = []

    const injectHideRule = (els: HTMLElement[]) => {
      // Mark default breadcrumb, droplist sibling, and their shared parent .cell.
      // Only hide at >=700px — our cloned <nav> takes over there. On mobile (<700px)
      // the cloned nav is hidden, so we let T4's native droplist (with + button) render.
      els.forEach(el => el.setAttribute('data-bricks-hide', ''))
      markedEls = els
      injectedStyle = document.createElement('style')
      injectedStyle.textContent = '@media (min-width: 700px) { [data-bricks-hide] { display: none !important; } }'
      document.head.appendChild(injectedStyle)
    }

    ;(this as any)._breadcrumbCleanup = () => {
      injectedStyle?.remove()
      headObserver?.disconnect()
      breadcrumbsObserver?.disconnect()
      markedEls.forEach(el => el.removeAttribute('data-bricks-hide'))
      t4Snapshot.forEach(({ el, position, positionPri, marginTop, marginTopPri }) => {
        if (position) el.style.setProperty('position', position, positionPri)
        else el.style.removeProperty('position')
        if (marginTop) el.style.setProperty('margin-top', marginTop, marginTopPri)
        else el.style.removeProperty('margin-top')
      })
    }

    const fixPositions = (targets: HTMLElement[]) => {
      targets.forEach(el => {
        el.style.setProperty('position', 'relative', 'important')
        el.style.setProperty('margin-top', '0', 'important')
      })
    }

    const applyBreadcrumbs = (el: HTMLElement) => {
      // T4's `#section-content a:hover` rule (with ~60 :not() pseudos + !important on
      // color/background) outranks any author CSS we can write. Inline-style attribute
      // with !important is the only thing that beats it per cascade rules.
      const styleClone = (source: HTMLElement): string => {
        const clone = source.cloneNode(true) as HTMLElement
        clone.classList.add('bricks-breadcrumbs')
        clone.querySelectorAll('a').forEach((a) => {
          const existing = a.getAttribute('style') ?? ''
          a.setAttribute(
            'style',
            `${existing}background:transparent !important;color:#54752f !important;`,
          )
        })
        return clone.outerHTML
      }

      // Find companion elements
      const droplist = el.parentElement?.querySelector<HTMLElement>('.c-breadcrumbs--droplist') ?? null
      const parent = el.parentElement

      // Clone both default breadcrumbs and the droplist (if present) so the mobile
      // "+" expander appears, matching behaviour on other Babson pages.
      this.breadcrumbsHtml = styleClone(el) + (droplist ? styleClone(droplist) : '')

      // Only treat the parent as a hide target if it's an isolated breadcrumb wrapper —
      // i.e. a Foundation `.cell` whose children are exclusively `.c-breadcrumbs*` variants.
      // This matches the T4 page layout (where the wrapper holds only breadcrumbs) but
      // refuses to hide `<body>` (unit-test fixture) or any broader container that ever
      // wraps real page content alongside the breadcrumbs.
      const wrapperIsIsolated = !!parent
        && parent.tagName === 'DIV'
        && parent.classList.contains('cell')
        && Array.from(parent.children).every(child => child.classList.contains('c-breadcrumbs'))
      const wrapper = wrapperIsIsolated ? parent : null

      const hideTargets = [el, ...(droplist ? [droplist] : []), ...(wrapper ? [wrapper] : [])]
      injectHideRule(hideTargets)

      const t4Targets = [el, ...(droplist ? [droplist] : [])]

      // Snapshot inline styles before mutating so we can restore on unmount
      t4Snapshot = t4Targets.map(t => ({
        el: t,
        position: t.style.getPropertyValue('position'),
        positionPri: t.style.getPropertyPriority('position'),
        marginTop: t.style.getPropertyValue('margin-top'),
        marginTopPri: t.style.getPropertyPriority('margin-top'),
      }))

      const fixAll = () => {
        const renderedClone = (this.$el as HTMLElement).querySelector<HTMLElement>('.bricks-breadcrumbs')
        fixPositions(renderedClone ? [...t4Targets, renderedClone] : t4Targets)
      }

      fixAll()
      this.$nextTick(fixAll)

      // T4 preview injects <style> blocks async after our fix runs; re-apply when any arrive
      headObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if ((node as Element).tagName === 'STYLE') {
              fixAll()
              return
            }
          }
        }
      })
      headObserver.observe(document.head, { childList: true })
      setTimeout(() => headObserver?.disconnect(), 5000)
    }

    const breadcrumbs = document.querySelector<HTMLElement>('.c-breadcrumbs--default')
    if (breadcrumbs) {
      applyBreadcrumbs(breadcrumbs)
    } else if (import.meta.env.DEV) {
      // Localhost: no T4 DOM — render placeholder breadcrumbs for local preview
      const mock = document.createElement('div')
      mock.className = 'c-breadcrumbs c-breadcrumbs--default bricks-breadcrumbs'
      const ul = document.createElement('ul')
      ;[['#', 'Alumni'], ['#', 'About Us'], [null, 'Find My Brick']].forEach(([href, text]) => {
        const li = document.createElement('li')
        if (href) { const a = document.createElement('a'); a.href = href; a.textContent = text; li.appendChild(a) }
        else li.textContent = text
        ul.appendChild(li)
      })
      mock.appendChild(ul)
      this.breadcrumbsHtml = mock.outerHTML
    } else {
      // T4 preview renders navigation layouts async — wait for element
      breadcrumbsObserver = new MutationObserver(() => {
        const found = document.querySelector<HTMLElement>('.c-breadcrumbs--default')
        if (found) {
          breadcrumbsObserver?.disconnect()
          applyBreadcrumbs(found)
        }
      })
      breadcrumbsObserver.observe(document.body, { childList: true, subtree: true })
      setTimeout(() => breadcrumbsObserver?.disconnect(), 3000)
    }

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
/* Fallback breadcrumb styles for dev/local preview.
   In production, Babson's global CSS targets .c-breadcrumbs which the clone retains.
   .bricks-breadcrumbs is an extra marker used to exempt the clone from our hide rule. */
:deep(.bricks-breadcrumbs ul) {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
}
:deep(.bricks-breadcrumbs li) {
  font-family: 'Zilla Slab', serif;
  font-size: 14px !important;
  color: #464646;
}
:deep(.bricks-breadcrumbs li + li::before) {
  content: '/';
  margin-right: 0.25rem;
  color: #464646;
}
:deep(.bricks-breadcrumbs a) {
  color: #54752f;
  text-decoration: none !important;
}
:deep(.bricks-breadcrumbs a:hover) {
  text-decoration: underline !important;
}

h1 {
  font-family: 'Oswald', sans-serif;
  font-weight: 400;
  color: #006644;
  font-size: 3.2rem;
  margin-top: 1.5rem !important;
  padding-top: 0 !important; /* beats T4's #page-main-content { padding-top: 11rem } */
  margin-bottom: 1.8rem;
  margin-left: 0;
  margin-right: 0;
}
@media screen and (min-width: 40em) {
  h1 {
    font-size: 3.8rem;
    margin-top: 1.5rem !important;
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
