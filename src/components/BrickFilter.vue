<template>
  <form class="container mx-auto max-w-6xl bg-yellow-100 py-2 mb-5">
  <div class="form-control">
    <label for="search-brick" class="mr-2">Search bricks by name</label>
    <input id="search-brick"  :value="inscription" @input="$emit('update:inscription', $event.target.value)" type="text"/>
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
   filterName(inscription) {
      this.$emit('update:inscription', inscription) // previously was `this.$emit('input', title)`
    }
  }
}
</script>

<style scoped>

</style>

