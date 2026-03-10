<template>
<div class="tw-w-full tw-pb-brick40 md:tw-pb-brick60 lg:tw-pb-brick80">
  <the-bricks/>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TheBricks from './components/TheBricks.vue'

export default defineComponent({
  components: {
    TheBricks,
  },
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
