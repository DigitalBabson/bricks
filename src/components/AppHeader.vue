<template>
  <header class="tw-bg-brickBabsonGreen tw-w-full tw-py-6 tw-px-6">
    <div class="tw-max-w-brickMWL tw-mx-auto">
      <h1 class="tw-m-0">
        <babson-logo id-prefix="header-logo" />
      </h1>
      <p class="tw-font-oswald tw-text-white tw-uppercase tw-text-base tw-m-0 -tw-mt-[4px]">
        Find My Brick at Kerry Murphy Healey Park
      </p>
    </div>
  </header>
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
