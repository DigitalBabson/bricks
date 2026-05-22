<template>
<div class="bricks__pagination tw-container
      tw-mx-auto tw-mt-brick9 md:tw-mt-brick35 lg:tw-mt-brick50
      tw-max-w-6xl tw-text-center">
  <button
  class="tw-bg-brickBabsonGreen tw-text-white
  tw-font-oswald tw-px-9
  tw-py-4 tw-uppercase
  hover:tw-bg-brickLightGreen hover:tw-text-black
  focus:tw-outline-none active:tw-outline-none
  tw-transition-background tw-duration-200 tw-ease-in-out
  "
  @click="$emit('loadmore')">Load more</button>
  </div>
</template>

<script>

export default {
  emits: ['loadmore'],
}

</script>

<style scoped>

</style>
