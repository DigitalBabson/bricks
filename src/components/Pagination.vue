<template>
  <nav
    v-if="totalPages > 1"
    aria-label="Page navigation"
    class="
      bricks__pagination
      tw-container tw-mx-auto
      tw-mt-[5rem]
      tw-flex tw-justify-center tw-items-center tw-gap-2
      tw-font-oswald tw-text-[20px]
    "
  >
    <button
      :disabled="currentPage === 1"
      aria-label="Previous page"
      class="tw-px-3 tw-py-2 tw-text-[#464646]"
      :class="currentPage === 1 ? 'tw-opacity-30 tw-cursor-not-allowed' : 'hover:tw-text-brickBabsonGreen'"
      @click="currentPage > 1 && $emit('update:page', currentPage - 1)"
    >
      <i class="fa-regular fa-angle-left"></i>
    </button>

    <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
      <span v-if="page === '...'" class="tw-px-2 tw-text-[#464646]">...</span>
      <button
        v-else
        class="tw-px-3 tw-py-2 tw-min-w-[2.5rem] tw-text-[#464646] hover:tw-text-brickBabsonGreen"
        :class="
          page === currentPage
            ? 'page-active'
            : ''
        "
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="$emit('update:page', page)"
      >
        {{ page }}
      </button>
    </template>

    <button
      :disabled="currentPage === totalPages"
      aria-label="Next page"
      class="tw-px-3 tw-py-2 tw-text-[#464646]"
      :class="currentPage === totalPages ? 'tw-opacity-30 tw-cursor-not-allowed' : 'hover:tw-text-brickBabsonGreen'"
      @click="currentPage < totalPages && $emit('update:page', currentPage + 1)"
    >
      <i class="fa-regular fa-angle-right"></i>
    </button>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    currentPage: { type: Number, required: true },
    totalPages: { type: Number, required: true },
    maxVisible: { type: Number, default: 5 },
  },
  emits: ['update:page'],
  computed: {
    visiblePages(): (number | string)[] {
      const { currentPage, totalPages, maxVisible } = this

      if (totalPages <= maxVisible + 2) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
      }

      if (currentPage <= maxVisible) {
        const pages: (number | string)[] = []
        for (let i = 1; i <= maxVisible; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
        return pages
      }

      if (currentPage > totalPages - maxVisible) {
        const pages: (number | string)[] = [1, '...']
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i)
        return pages
      }

      const half = Math.floor(maxVisible / 2)
      const pages: (number | string)[] = [1, '...']
      for (let i = currentPage - half; i <= currentPage + half; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
      return pages
    },
  },
})
</script>

<style scoped>
.page-active {
  position: relative;
}
.page-active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 4px;
  background-color: #587C32;
}
</style>
