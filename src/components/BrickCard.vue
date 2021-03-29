<template>
<article class="brick-card border border-gray-100 shadow-sm text-center">
  <img :src="brick.imgLink" @click="openImg"/>
  <teleport to="body">
    <transition name="fade">
  <ui-modal v-if="showImg" @close="closeImg">
    <img class="object-contain max-h-full" :src="brick.imgLink" />
</ui-modal>
    </transition>
  </teleport>
  <button class="bg-gray-100 p-3 my-3" @click="openMap">View on map</button>

</article>
<!--brick-map v-if="showMap" :zone="brick.zone" @close="closeMap" />-->
<teleport to="body">
  <transition name="fade">
<ui-modal v-if="showMap" @close="closeMap">
    <img class="object-contain max-h-full" :src="'src/assets/maps/'+brick.zone+'.jpg'" />
</ui-modal>
  </transition>
</teleport>
</template>

<script>
//import BrickMap from './BrickMap.vue';
import UiModal from './UiModal.vue';
export default {
  props: ['brick'],
  data() {
    return {
      showMap: false,
      showImg: false,
    }
  },
	components: {
		//BrickMap,
    UiModal,
	},
  methods: {
    openMap() {
      this.showMap = true;
    },
    closeMap() {
      this.showMap = false;
    },
    openImg() {
      this.showImg = true;
    },
    closeImg() {
      this.showImg = false;
    }
  }
}
</script>

<style scoped>
button {
  color:#064;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
