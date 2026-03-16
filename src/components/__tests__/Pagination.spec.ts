import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '../Pagination.vue'

function mountPagination(props: { currentPage: number; totalPages: number; maxVisible?: number }) {
  return mount(Pagination, { props })
}

describe('Pagination', () => {
  describe('Rendering', () => {
    it('renders nav with aria-label', () => {
      const wrapper = mountPagination({ currentPage: 1, totalPages: 5 })
      const nav = wrapper.find('nav')
      expect(nav.exists()).toBe(true)
      expect(nav.attributes('aria-label')).toBe('Page navigation')
    })

    it('renders correct number of page buttons for small page count', () => {
      const wrapper = mountPagination({ currentPage: 1, totalPages: 3 })
      // 3 page buttons + 2 arrow buttons = 5 buttons
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(5)
    })

    it('does not render when totalPages <= 1', () => {
      const wrapper = mountPagination({ currentPage: 1, totalPages: 1 })
      expect(wrapper.find('nav').exists()).toBe(false)
    })

    it('highlights active page with aria-current and page-active class', () => {
      const wrapper = mountPagination({ currentPage: 2, totalPages: 5 })
      const activeButton = wrapper.find('[aria-current="page"]')
      expect(activeButton.exists()).toBe(true)
      expect(activeButton.text()).toBe('2')
      expect(activeButton.classes()).toContain('page-active')
    })

    it('inactive pages have correct base color class', () => {
      const wrapper = mountPagination({ currentPage: 1, totalPages: 5 })
      // Page 2 should be inactive — no page-active class
      const pageButtons = wrapper.findAll('button').filter(b => b.text() === '2')
      expect(pageButtons[0].classes()).not.toContain('page-active')
    })

    it('disables previous arrow on page 1', () => {
      const wrapper = mountPagination({ currentPage: 1, totalPages: 5 })
      const prevButton = wrapper.find('[aria-label="Previous page"]')
      expect(prevButton.attributes('disabled')).toBeDefined()
    })

    it('disables next arrow on last page', () => {
      const wrapper = mountPagination({ currentPage: 5, totalPages: 5 })
      const nextButton = wrapper.find('[aria-label="Next page"]')
      expect(nextButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Ellipsis logic', () => {
    it('shows no ellipsis when totalPages <= maxVisible + 2', () => {
      const wrapper = mountPagination({ currentPage: 1, totalPages: 7 })
      expect(wrapper.text()).not.toContain('...')
    })

    it('shows trailing ellipsis near the start', () => {
      const wrapper = mountPagination({ currentPage: 2, totalPages: 50 })
      const spans = wrapper.findAll('span')
      const ellipses = spans.filter(s => s.text() === '...')
      expect(ellipses).toHaveLength(1)
      // Last page number should be visible
      expect(wrapper.text()).toContain('50')
    })

    it('shows leading ellipsis near the end', () => {
      const wrapper = mountPagination({ currentPage: 49, totalPages: 50 })
      const spans = wrapper.findAll('span')
      const ellipses = spans.filter(s => s.text() === '...')
      expect(ellipses).toHaveLength(1)
      // First page should be visible
      expect(wrapper.text()).toContain('1')
    })

    it('shows both ellipses in the middle', () => {
      const wrapper = mountPagination({ currentPage: 25, totalPages: 50 })
      const spans = wrapper.findAll('span')
      const ellipses = spans.filter(s => s.text() === '...')
      expect(ellipses).toHaveLength(2)
      // First and last pages should be visible
      expect(wrapper.text()).toContain('1')
      expect(wrapper.text()).toContain('50')
    })
  })

  describe('Emit behavior', () => {
    it('clicking a page number emits update:page with that number', async () => {
      const wrapper = mountPagination({ currentPage: 1, totalPages: 5 })
      const page3 = wrapper.findAll('button').find(b => b.text() === '3')!
      await page3.trigger('click')
      expect(wrapper.emitted('update:page')).toEqual([[3]])
    })

    it('clicking previous emits update:page with currentPage - 1', async () => {
      const wrapper = mountPagination({ currentPage: 3, totalPages: 5 })
      const prevButton = wrapper.find('[aria-label="Previous page"]')
      await prevButton.trigger('click')
      expect(wrapper.emitted('update:page')).toEqual([[2]])
    })

    it('clicking next emits update:page with currentPage + 1', async () => {
      const wrapper = mountPagination({ currentPage: 3, totalPages: 5 })
      const nextButton = wrapper.find('[aria-label="Next page"]')
      await nextButton.trigger('click')
      expect(wrapper.emitted('update:page')).toEqual([[4]])
    })

    it('clicking disabled previous arrow does not emit', async () => {
      const wrapper = mountPagination({ currentPage: 1, totalPages: 5 })
      const prevButton = wrapper.find('[aria-label="Previous page"]')
      await prevButton.trigger('click')
      expect(wrapper.emitted('update:page')).toBeUndefined()
    })

    it('clicking disabled next arrow does not emit', async () => {
      const wrapper = mountPagination({ currentPage: 5, totalPages: 5 })
      const nextButton = wrapper.find('[aria-label="Next page"]')
      await nextButton.trigger('click')
      expect(wrapper.emitted('update:page')).toBeUndefined()
    })
  })
})
