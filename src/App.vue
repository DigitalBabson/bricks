<template>
<div class="w-full">
  <the-bricks/>
</div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue';
import BabsonHeader from './components/BabsonHeader.vue';
import TheBricks from './components/TheBricks.vue';

export default {
	components: {
		TheBricks,
    BabsonHeader
	}
}
// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
