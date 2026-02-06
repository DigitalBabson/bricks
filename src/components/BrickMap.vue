<template>
<teleport to="body">
<div class="tw-absolute tw-inset-0 tw-bg-gray-900 tw-opacity-50" @click="$emit('close')"></div>
<dialog class="tw-absolute tw-inset-0 tw-h-5/6 tw-p-0" open>
blah
  <img class="tw-object-contain tw-max-h-full" :src="'src/assets/maps/'+zone+'.jpg'" />
</dialog>
<button class="tw-absolute tw-top-5 tw-right-5" @click="$emit('close')">X</button>
</teleport>
</template>

<script>
export default {
  props: ['zone'],
  emits: ['close'],
  data() {
    return {
      showMap: false,
      showImg: false,
      brickImgUrl: ''
    }
  },
  methods: {

  }
}

</script>

<style scoped>

</style>
