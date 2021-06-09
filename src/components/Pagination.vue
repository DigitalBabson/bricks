<template>
<div class="tw-container
      tw-mx-auto
      tw-max-w-6xl tw-py-8 tw-mb-5 tw-text-center">
  <button class="tw-ml-5 tw-py-2 tw-px-5" @click="$emit('loadmore')">Load more</button>
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
