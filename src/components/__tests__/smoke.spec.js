import { describe, it, expect } from 'vitest'

describe('Smoke Test', () => {
  it('vitest is configured correctly', () => {
    expect(true).toBe(true)
  })

  it('can perform basic assertions', () => {
    const value = 42
    expect(value).toBe(42)
    expect(value).toBeGreaterThan(40)
  })

  it('can test arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  it('can test objects', () => {
    const obj = { name: 'test', value: 123 }
    expect(obj).toHaveProperty('name')
    expect(obj.value).toBe(123)
  })
})
