<template>
  <form class="tw-w-full tw-py-8 tw-mb-5 tw-bg-brickLightGreen" @submit.prevent>
  <div class="tw-container tw-mx-auto tw-form-control tw-py-1 tw-text-center tw-text-m">
    <label for="search-brick">Search for my brick inscription</label>
    <input id="search-brick" :value="inscription" @input="$emit('update:inscription', $event.target.value)" type="text"/>
  </div>
</form>
</template>
<script>
export default {
  props: {
    inscription: String // previously was `value: String`
  },
  emits: ['update:inscription', 'reset'],
  methods: {
  //  filterName(inscription) {
  //     this.$emit('update:inscription', inscription)
  //   }
  }
}
</script>

<style scoped>
/* form {
  background-color: #C7D28A;
} */
form label {
  display: inline;
}
input#search-brick {
  display: inline-block;
  margin-left: 1rem;
  width: initial !important;
}
</style>

