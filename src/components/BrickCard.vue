<template>
<article class="brick-card tw-border tw-border-gray-100 tw-shadow-sm tw-text-center">
  <img :src="brickImgUrl" @click="openImg"/>
  <teleport to="body">
    <transition name="fade">
  <ui-modal v-if="showImg" @close="closeImg">
    <img class="tw-object-contain" :src="brickImgUrl" />
</ui-modal>
    </transition>
  </teleport>
  <button class="tw-bg-gray-100 tw-p-3 tw-my-3" @click="openMap">View on map</button>

</article>
<!--brick-map v-if="showMap" :zone="brick.zone" @close="closeMap" />-->
<teleport to="body">
  <transition name="fade">
<ui-modal v-if="showMap" @close="closeMap">
    <img class="tw-object-contain tw-max-w-7xl" :src="parkLocationImgURL" />
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
  inject: ["defaultEnv", "defaultUrl"],
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
      const url = this.defaultUrl + `media/image/`
      //axios.defaults.withCredentials = true;
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
    this.brickImgUrl = this.defaultEnv + response.data.included[0].attributes.uri.url;
    },
    async getParkLocationImgURL() {
      const url = this.defaultUrl + `parkLocations/` + this.brick.brickParkLocation + `?fields[file--file]=uri,url`
      //axios.defaults.withCredentials = true;
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
    this.parkLocationImgURL = this.defaultEnv + response.data.included[1].attributes.uri.url;
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
