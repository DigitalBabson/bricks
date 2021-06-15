<template>
  <form class="bricks__search-form tw-w-full tw-py-brick30 tw-mb-brick10 tw-bg-brickLightGreen" @submit.prevent>
  <div class="tw-container tw-mx-auto tw-form-control tw-py-1 tw-text-center tw-text-m">
    <label for="search-brick">Search for my brick inscription</label>
    <input id="search-brick" class="tw-mt-4 md:tw-mt0 tw-leading-8"
    :value="inscription" @input="$emit('update:inscription', $event.target.value)" type="text"/>
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
form.bricks__search-form label {
  display: inline;
  color: #000;
}
input#search-brick {
  display: inline-block;
  width: 300px !important;
  border: none;
  margin-left: 1rem;
}
</style>

