<template>
<div class="container
      mx-auto
      max-w-6xl py-8 mb-5 text-center">
  <button class="ml-5 py-2 px-5" @click="$emit('loadmore')">Load more</button>
  </div>
</template>

<script>

export default {
  emits: ['loadmore'],
}

</script>

<style scoped>
button {
  background-color:#064;
  color: #fff;
  text-transform: uppercase;
}
</style>
