import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BrickFilter from '../BrickFilter.vue'

describe('BrickFilter', () => {
  describe('Component Rendering', () => {
    it('renders search form with input and button', () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: ''
        }
      })

      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.find('input#search-brick').exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('renders correct label text', () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: ''
        }
      })

      const label = wrapper.find('label[for="search-brick"]')
      expect(label.text()).toBe('Search by Brick Inscription')
    })

    it('renders clear button with icon', () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: ''
        }
      })

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.find('i.fas.fa-times').exists()).toBe(true)
    })
  })

  describe('Props', () => {
    it('accepts inscription prop', () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: 'test search'
        }
      })

      expect((wrapper as any).props('inscription')).toBe('test search')
    })

    it('displays inscription value in input', () => {
      const testValue = 'John Doe'
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: testValue
        }
      })

      const input = wrapper.find('input#search-brick')
      expect((input.element as HTMLInputElement).value).toBe(testValue)
    })
  })

  describe('Events', () => {
    it('emits update:inscription event when input changes', async () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: ''
        }
      })

      const input = wrapper.find('input#search-brick')
      await input.setValue('new search')

      expect(wrapper.emitted()).toHaveProperty('update:inscription')
      expect(wrapper.emitted('update:inscription')![0]).toEqual(['new search'])
    })

    it('emits update:inscription event on each keystroke', async () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: ''
        }
      })

      const input = wrapper.find('input#search-brick')

      await input.setValue('J')
      await input.setValue('Jo')
      await input.setValue('Joh')

      expect(wrapper.emitted('update:inscription')).toHaveLength(3)
      expect(wrapper.emitted('update:inscription')![0]).toEqual(['J'])
      expect(wrapper.emitted('update:inscription')![1]).toEqual(['Jo'])
      expect(wrapper.emitted('update:inscription')![2]).toEqual(['Joh'])
    })

    it('emits update:inscription with empty string when clear button is clicked', async () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: 'some text'
        }
      })

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(wrapper.emitted()).toHaveProperty('update:inscription')
      expect(wrapper.emitted('update:inscription')![0]).toEqual([''])
    })
  })

  describe('Styling', () => {
    it('applies Tailwind CSS classes to form', () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: ''
        }
      })

      const form = wrapper.find('form')
      expect(form.classes()).toContain('tw-w-full')
      expect(form.classes()).toContain('tw-bg-brickCourtyardGreen')
      expect(form.classes()).toContain('tw-mx-auto')
    })
  })
})
