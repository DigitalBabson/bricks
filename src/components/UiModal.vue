<template>
  <div>
    <!--teleport to="body"-->

    <div
      class="tw-fixed tw-inset-0 tw-bg-gray-900 tw-opacity-80 tw-z-50"
      @click="$emit('close')"></div>
    <dialog
      class="tw-fixed tw-inset-0 tw-md:h-5/6 tw-p-0 tw-z-50 tw-mx-auto"
      open>
      <slot />
    </dialog>
    <button class="tw-fixed tw-top-5 lg:tw-top-8 tw-right-5 lg:tw-right-8 tw-text-white tw-z-50 tw-text-5xl" @click="$emit('close')">
      <i class="fas fa-times"></i>
    </button>

    <!--/teleport-->
  </div>
</template>

<script>
export default {
  emits: ["close"],
};
</script>

<style scoped>
dialog {
  max-width: 90%;
}
</style>
