<template>
<teleport to="body">
<div class="absolute inset-0 bg-gray-900 opacity-50" @click="$emit('close')"></div>
  <dialog class="absolute inset-0 md:h-5/6 p-0" open>
    <slot />
  </dialog>
<button class="absolute top-5 right-5" @click="$emit('close')">X</button>
</teleport>
</template>

<script>
export default {
  emits: ['close'],
}

</script>

<style scoped>

</style>
