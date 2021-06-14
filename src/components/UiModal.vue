<template>
  <div>
<!--teleport to="body"-->

<div class="tw-fixed tw-inset-0 tw-bg-gray-900 tw-opacity-80 tw-z-50" @click="$emit('close')"></div>
  <dialog class="tw-fixed tw-inset-0 tw-md:h-5/6 tw-p-0 tw-z-50 tw-mx-auto" open>
    <slot />
  </dialog>
<button class="tw-fixed tw-top-5 tw-right-5" @click="$emit('close')">X</button>

<!--/teleport-->
</div>
</template>

<script>
export default {
  emits: ['close'],
}

</script>

<style scoped>
dialog {
  max-width: 90%;
}
</style>
