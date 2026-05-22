<template>
  <form class="
  bricks__search-form
  tw-w-full
  tw-py-8 md:tw-py-12 lg:tw-py-brick30
  tw-mb-brick9 lg:tw-mb-brick10
  tw-bg-brickLightGreen"
  @submit.prevent>
  <div class="tw-container tw-mx-auto tw-form-control tw-py-1 tw-px-8 md:tw-text-center tw-text-m">
    <label for="search-brick">Search for my brick inscription</label>
    <div class="bricks__search-form--button tw-inline-block tw-relative tw-w-full md:tw-w-auto">
      <input id="search-brick" class="tw-leading-8"
      :value="inscription" @input="$emit('update:inscription', $event.target.value)" type="text"  />
      <input type="submit" class="form-submit" />
      <button class="ml-5 tw-absolute tw-right-2 tw-top-0 tw-bottom-0 tw-focus:outline-none" @click="resetSearch"><i class="fas fa-times tw-text-brickMediumGreen"></i></button>
    </div>
  </div>
</form>
</template>
<script>
export default {
  props: {
    inscription: String // previously was `value: String`
  },
  emits: ['update:inscription'],
  methods: {
    resetSearch() {
      this.$emit('update:inscription', '')
    },
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
  display: block;
  color: #000;
  margin-bottom: .8rem
}
input#search-brick {
  width: 100% !important;
  border: none;
  display: block;
}
button {
  font-size: 24px;
}
button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
@media screen and (min-width:767px) {
  form.bricks__search-form label {
    display: inline;
    margin-bottom: 0;
  }
  input#search-brick {
    display: inline-block;
    width: 370px !important;
    margin-left: 2rem;
  }
}
.form-submit {
  @apply tw-hidden;
}
</style>

