<template>
<div class="tw-w-full tw-pb-brick40 md:tw-pb-brick60 lg:tw-pb-brick80">
  <the-bricks/>
</div>
</template>

<script>
import TheBricks from './components/TheBricks.vue';

export default {
	components: {
		TheBricks,
	},
  provide() {
    const drupalEnv = {
      local: 'https://d9.ddev.site',
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
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
