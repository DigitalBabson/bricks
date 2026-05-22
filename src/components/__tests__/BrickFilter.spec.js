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
      expect(label.text()).toBe('Search for my brick inscription')
    })

    it('renders clear button with correct text', () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: ''
        }
      })

      const button = wrapper.find('button')
      expect(button.text()).toBe('Clear')
    })
  })

  describe('Props', () => {
    it('accepts inscription prop', () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: 'test search'
        }
      })

      expect(wrapper.props('inscription')).toBe('test search')
    })

    it('displays inscription value in input', () => {
      const testValue = 'John Doe'
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: testValue
        }
      })

      const input = wrapper.find('input#search-brick')
      expect(input.element.value).toBe(testValue)
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
      expect(wrapper.emitted('update:inscription')[0]).toEqual(['new search'])
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
      expect(wrapper.emitted('update:inscription')[0]).toEqual(['J'])
      expect(wrapper.emitted('update:inscription')[1]).toEqual(['Jo'])
      expect(wrapper.emitted('update:inscription')[2]).toEqual(['Joh'])
    })

    it('emits update:reset event when clear button is clicked', async () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: 'some text'
        }
      })

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(wrapper.emitted()).toHaveProperty('update:reset')
      expect(wrapper.emitted('update:reset')).toHaveLength(1)
    })
  })

  describe('Styling', () => {
    it('has correct background color on form', () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: ''
        }
      })

      const form = wrapper.find('form')
      // Check that the scoped style is applied (component has the style)
      expect(wrapper.html()).toContain('background-color: #C7D28A')
    })

    it('applies correct CSS classes', () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: ''
        }
      })

      const form = wrapper.find('form')
      expect(form.classes()).toContain('w-full')
      expect(form.classes()).toContain('py-8')
      expect(form.classes()).toContain('mb-5')
    })
  })

  describe('User Interaction Flow', () => {
    it('handles complete search and clear flow', async () => {
      const wrapper = mount(BrickFilter, {
        props: {
          inscription: ''
        }
      })

      // User types in search box
      const input = wrapper.find('input#search-brick')
      await input.setValue('Jane Smith')

      expect(wrapper.emitted('update:inscription')).toHaveLength(1)
      expect(wrapper.emitted('update:inscription')[0]).toEqual(['Jane Smith'])

      // User clicks clear button
      const button = wrapper.find('button')
      await button.trigger('click')

      expect(wrapper.emitted('update:reset')).toHaveLength(1)
    })
  })
})
