import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, withDirectives } from 'vue'
import { fadeInOnLoad, HIDDEN_CLASS, LOADED_CLASS } from '../fadeInOnLoad'

// jsdom never loads images, so fake whether one is already in the cache by
// defining `complete` and `naturalWidth` before the directive's mounted hook runs.
function mountImage(cached: boolean) {
  const Host = defineComponent({
    setup() {
      return () =>
        withDirectives(
          h('img', {
            src: 'https://example.com/map.png',
            onVnodeBeforeMount: (vnode) => {
              const el = vnode.el as HTMLImageElement
              Object.defineProperty(el, 'complete', { value: cached, configurable: true })
              Object.defineProperty(el, 'naturalWidth', { value: cached ? 861 : 0, configurable: true })
            },
          }),
          [[fadeInOnLoad]],
        )
    },
  })
  return mount(Host).find('img')
}

describe('fadeInOnLoad', () => {
  it('hides an image that is still loading', () => {
    const img = mountImage(false)

    expect(img.classes()).toContain(HIDDEN_CLASS)
    expect(img.classes()).not.toContain(LOADED_CLASS)
  })

  it('reveals the image once it loads', async () => {
    const img = mountImage(false)

    await img.trigger('load')

    expect(img.classes()).toContain(LOADED_CLASS)
  })

  it('reveals the image if it fails, so its alt text is not hidden', async () => {
    const img = mountImage(false)

    await img.trigger('error')

    expect(img.classes()).toContain(LOADED_CLASS)
  })

  it('shows a cached image straight away', () => {
    const img = mountImage(true)

    expect(img.classes()).toContain(HIDDEN_CLASS)
    expect(img.classes()).toContain(LOADED_CLASS)
  })
})
