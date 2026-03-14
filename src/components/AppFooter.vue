<template>
  <footer class="tw-bg-brickBabsonGreen tw-w-full tw-py-4 tw-px-6">
    <div class="tw-max-w-brickMWL tw-mx-auto">
      <babson-logo id-prefix="footer-logo" />
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BabsonLogo from './BabsonLogo.vue'

export default defineComponent({
  components: {
    BabsonLogo,
  },
})
</script>
