<template>
<div class="tw-w-full tw-pb-brick40 md:tw-pb-brick60 lg:tw-pb-brick80">
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
	},
  provide() {
    const drupalEnv = {
      dev: "https://dev.intranet.babson.edu",
      stage: "https://stage.intranet.babson.edu",
      stage2: "https://stage2.intranet.babson.edu",
      prod: "https://intranet.babson.edu"
    }
    const feedUrl = "/jsonapi/"
    return  {
      defaultEnv:  drupalEnv.prod,
      defaultUrl:  drupalEnv.prod + feedUrl
    }
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
