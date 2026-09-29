import type { Directive } from 'vue'

// Fades an <img> in once it has loaded, instead of letting it pop in on top of
// an already-visible modal. Only the element's first image counts: a cached
// image shows straight away, and later src swaps (switching maps in the
// explorer) are left alone, since the browser keeps the old image on screen
// until the new one arrives.
export const HIDDEN_CLASS = 'bricks-img-fade'
export const LOADED_CLASS = 'is-loaded'

function reveal(el: HTMLImageElement): void {
  el.classList.add(LOADED_CLASS)
}

export const fadeInOnLoad: Directive<HTMLImageElement> = {
  mounted(el) {
    el.classList.add(HIDDEN_CLASS)
    if (el.complete && el.naturalWidth > 0) {
      reveal(el)
      return
    }
    // Reveal on error too, so the alt text of a broken image isn't hidden.
    el.addEventListener('load', () => reveal(el), { once: true })
    el.addEventListener('error', () => reveal(el), { once: true })
  },
}
