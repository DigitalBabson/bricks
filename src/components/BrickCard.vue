<template>
<article class="brick-card border border-gray-100 shadow-sm text-center">
  <img :src="brickImgUrl" @click="openImg"/>
  <teleport to="body">
    <transition name="fade">
  <ui-modal v-if="showImg" @close="closeImg">
    <img class="object-contain max-h-full" :src="brickImgUrl" />
</ui-modal>
    </transition>
  </teleport>
  <button class="bg-gray-100 p-3 my-3" @click="openMap">View on map</button>

</article>
<!--brick-map v-if="showMap" :zone="brick.zone" @close="closeMap" />-->
<teleport to="body">
  <transition name="fade">
<ui-modal v-if="showMap" @close="closeMap">
    <img class="object-contain max-h-full" :src="parkLocationImgURL" />
</ui-modal>
  </transition>
</teleport>
</template>

<script>
//import BrickMap from './BrickMap.vue';
import UiModal from './UiModal.vue';
import axios from "axios";
export default {
  props: ['brick'],
  data() {
    return {
      showMap: false,
      showImg: false,
      brickImgUrl: '',
      parkLocationImgURL: ''
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
    },
    async getBrickImgURL() {
      const url = `https://stage2.bell.babson.edu/jsonapi/media/image/`
      axios.defaults.withCredentials = true;
      const response = await axios.get(url + this.brick.brickImage, {}, {
      headers: {
        'crossDomain': true,
        'Content-Type': 'application/json'
      }
  // auth: {
  //   username: babson,
  //   password: drupal9
  // }
  })
    this.brickImgUrl = 'https://stage2.bell.babson.edu' + response.data.included[0].attributes.uri.url;
    },
    async getParkLocationImgURL() {
      const url = `https://stage2.bell.babson.edu/jsonapi/parkLocations/` + this.brick.brickParkLocation + `?fields[file--file]=uri,url`
      axios.defaults.withCredentials = true;
      const response = await axios.get(url, {}, {
      headers: {
        'crossDomain': true,
        'Content-Type': 'application/json'
      }
  // auth: {
  //   username: babson,
  //   password: drupal9
  // }
  })
  //console.log(response);
    this.parkLocationImgURL = 'https://stage.bell.babson.edu' + response.data.included[1].attributes.uri.url;
    }
  },
  mounted() {
    this.getBrickImgURL();
    this.getParkLocationImgURL();
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
