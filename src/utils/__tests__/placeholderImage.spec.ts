import { describe, it, expect } from 'vitest'
import { isDefaultDrupalImage, isPlaceholderAssetPath } from '../placeholderImage'

// What .env.stage2 / .env.production configure — the 2026-03/ copy.
const CONFIGURED = 'https://stage2.contentfiles.babson.edu/sites/default/files/2026-03/coming-soon-gray.jpg'

const file = (value: string, url: string) => ({ attributes: { uri: { value, url } } })

describe('isPlaceholderAssetPath', () => {
  it.each([
    'public://images/bricks/coming-soon-gray.jpg',
    '/sites/default/files/default_images/coming-soon-gray.jpg',
    '/sites/default/files/2026-03/coming-soon-gray.jpg',
    'public://2026-04/coming-soon-gray_0.jpg',
    'https://contentfiles.babson.edu/sites/default/files/images/bricks/coming-soon-gray.jpg?itok=abc',
  ])('recognises %s as the placeholder', (path) => {
    expect(isPlaceholderAssetPath(path, CONFIGURED)).toBe(true)
  })

  it.each([
    'public://images/bricks/1.jpg',
    'public://images/bricks/coming-soon-gray-smith.jpg',
    'public://images/bricks/coming-soon-gray.png',
    '',
    undefined,
  ])('does not treat %s as the placeholder', (path) => {
    expect(isPlaceholderAssetPath(path, CONFIGURED)).toBe(false)
  })
})

describe('isDefaultDrupalImage', () => {
  it('flags a brick whose image is a different copy than the configured placeholder', () => {
    // Stage2 bricks such as "JOHN PETERS 1980" reference images/bricks/, not 2026-03/.
    const brickFile = file(
      'public://images/bricks/coming-soon-gray.jpg',
      '/sites/default/files/images/bricks/coming-soon-gray.jpg'
    )
    expect(isDefaultDrupalImage('1b458e85-7575-4e00-9658-eacdb769ddaf', brickFile, CONFIGURED)).toBe(true)
  })

  it('leaves real brick photos alone', () => {
    const brickFile = file('public://images/bricks/1.jpg', '/sites/default/files/images/bricks/1.jpg')
    expect(isDefaultDrupalImage('958c79cd', brickFile, CONFIGURED)).toBe(false)
  })

  it('returns false when the file was not hydrated', () => {
    expect(isDefaultDrupalImage('958c79cd', undefined, CONFIGURED)).toBe(false)
  })
})
