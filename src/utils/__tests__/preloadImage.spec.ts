import { describe, it, expect, vi, afterEach } from 'vitest'
import { preloadImage } from '../preloadImage'

describe('preloadImage', () => {
  const OriginalImage = globalThis.Image

  afterEach(() => {
    globalThis.Image = OriginalImage
  })

  function spyOnImages() {
    const created: HTMLImageElement[] = []
    globalThis.Image = vi.fn(function () {
      const img = document.createElement('img')
      created.push(img)
      return img
    }) as unknown as typeof Image
    return created
  }

  it('starts loading the image', () => {
    const created = spyOnImages()

    preloadImage('https://example.com/map-a.png?v=1')

    expect(created).toHaveLength(1)
    expect(created[0].src).toBe('https://example.com/map-a.png?v=1')
  })

  it('fetches each URL only once', () => {
    const created = spyOnImages()

    preloadImage('https://example.com/map-b.png')
    preloadImage('https://example.com/map-b.png')
    preloadImage('https://example.com/map-c.png')

    expect(created.map((img) => img.src)).toEqual([
      'https://example.com/map-b.png',
      'https://example.com/map-c.png',
    ])
  })

  it('ignores a missing URL', () => {
    const created = spyOnImages()

    preloadImage(undefined)
    preloadImage('')

    expect(created).toHaveLength(0)
  })
})
