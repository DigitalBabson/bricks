<template>
<article class="brick-card border border-gray-100 shadow-sm text-center">
  <img :src="brick.imgLink" @click="openImg" class="cursor-pointer"/>
  <teleport to="body">
    <transition name="fade">
  <ui-modal v-if="showImg" @close="closeImg">
    <img class="object-contain max-h-full" :src="brick.imgLink" />
</ui-modal>
    </transition>
  </teleport>
  <button v-scroll-to="{el:'#bricks-map', duration: 1000}" class="sm-screen bg-gray-100 p-3 my-3" @click="$emit('update:map', 'src/assets/maps/'+brick.zone+'.jpg')">View on map</button>
  <button class="big-screen bg-gray-100 p-3 my-3" @click="$emit('update:map', 'src/assets/maps/'+brick.zone+'.jpg')">View on map</button>

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
  props: ['brick', 'map'],
  emits: ['update:map'],
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
  border: .2rem solid #ddd055;
  background: #fff;
  color: #005172;
}
button:hover {
  color: #fff;
  background: #005172;
  border: .2rem solid #005172;
}
button.big-screen {
  display: none;
}
@media (min-width: 768px) {
  button.sm-screen {
  display: none;
  }
  button.big-screen {
    display: inline-block;
  }

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
