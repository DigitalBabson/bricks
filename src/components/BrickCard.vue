<template>
<article class="brick-card tw-border tw-border-gray-100 tw-shadow-sm tw-text-center">
  <img :src="thumbnailUrl" @click="openImg"/>
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
    <div class="tw-text-center tw-bg-brickLightGreen">
      <h3><span>Brick Location: {{ parkLocation }}</span></h3>
      <h3><span>Brick Inscription: {{ brick.inscription }}</span></h3>
    </div>
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
      thumbnailUrl: '',
      parkLocationImgURL: '',
      parkLocation: ''
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
    this.thumbnailUrl = response.data.included[0].attributes.image_style_uri.find(({brick}) => brick).brick
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
    this.parkLocation = response.data.data.attributes.name
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
