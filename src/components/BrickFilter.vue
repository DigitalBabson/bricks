<template>
  <form class="w-full py-8 mb-5">
  <div class="form-control py-1 text-center text-m">
    <label for="search-brick" class="mr-4">Search for my brick inscription</label>
    <input id="search-brick"  :value="inscription" @input="$emit('update:inscription', $event.target.value)" type="text"/>
    <button class="ml-5" @click="$emit('update:reset')">Clear</button>
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
   filterName(inscription) {
      this.$emit('update:inscription', inscription) 
    }
  }
}
</script>

<style scoped>
form {
  background-color: #C7D28A;
}
</style>

