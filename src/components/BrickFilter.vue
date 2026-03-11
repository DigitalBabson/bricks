<template>
  <form class="
  bricks__search-form
  tw-w-full tw-max-w-[540px] tw-mx-auto
  tw-bg-brickCourtyardGreen tw-rounded tw-px-6 tw-py-5"
  @submit.prevent>
  <div class="tw-form-control tw-text-m">
    <label for="search-brick"
      class="tw-font-oswald tw-text-white tw-uppercase tw-text-sm tw-font-semibold tw-block tw-mb-2"
    >Search by Brick Inscription</label>
    <div class="bricks__search-form--button tw-relative tw-w-full">
      <input id="search-brick" class="tw-leading-8 tw-w-full tw-border tw-border-gray-300 tw-px-3 tw-py-1"
      :value="inscription" @input="$emit('update:inscription', ($event.target as HTMLInputElement).value)" type="text"  />
      <input type="submit" class="form-submit" />
      <button class="tw-absolute tw-right-2 tw-top-0 tw-bottom-0 focus:tw-outline-none" type="button" @click="resetSearch"><i class="fas fa-times tw-text-brickMediumGreen"></i></button>
    </div>
  </div>
</form>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    inscription: { type: String, required: true }
  },
  emits: {
    'update:inscription': (v: string) => typeof v === 'string'
  },
  methods: {
    resetSearch() {
      this.$emit('update:inscription', '')
    },
  }
})
</script>

<style scoped>
button {
  font-size: 24px;
}
.form-submit {
  @apply tw-hidden;
}
</style>
