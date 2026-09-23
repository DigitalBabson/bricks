import { describe, it, expect } from 'vitest'
import { withCacheBuster } from '../cacheBuster'

// 8055.jpg on stage2 was replaced in place at this time.
const CHANGED = '2026-09-23T16:33:02+00:00'

describe('withCacheBuster', () => {
  it('appends the changed timestamp to an image style URL that already has itok', () => {
    expect(withCacheBuster('https://h/styles/brick_preview/public/images/bricks/8055.jpg?itok=GhaZVJAN', CHANGED))
      .toBe('https://h/styles/brick_preview/public/images/bricks/8055.jpg?itok=GhaZVJAN&v=1790181182')
  })

  it('starts a query string when the URL has none', () => {
    expect(withCacheBuster('/sites/default/files/images/bricks/8055.jpg', CHANGED))
      .toBe('/sites/default/files/images/bricks/8055.jpg?v=1790181182')
  })

  it('gives a replaced file a different URL than the original upload', () => {
    const url = 'https://h/8055.jpg?itok=x'
    expect(withCacheBuster(url, '2026-09-23T01:26:37+00:00')).not.toBe(withCacheBuster(url, CHANGED))
  })

  it.each([undefined, '', 'not-a-date'])('leaves the URL alone when changed is %j', (changed) => {
    expect(withCacheBuster('https://h/a.jpg?itok=x', changed)).toBe('https://h/a.jpg?itok=x')
  })

  it('passes through a missing URL', () => {
    expect(withCacheBuster(undefined, CHANGED)).toBeUndefined()
    expect(withCacheBuster('', CHANGED)).toBe('')
  })
})
