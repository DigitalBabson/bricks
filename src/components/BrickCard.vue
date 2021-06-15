<template>
<article class="brick-card tw-border tw-border-gray-100 tw-shadow-sm tw-text-center">
  <img class="tw-cursor-pointer" :src="thumbnailUrl" @click="openImg"/>
  <teleport to="body">
    <transition name="fade">
  <ui-modal v-if="showImg" @close="closeImg">
    <img class="tw-object-contain" :src="brickImgUrl" />
</ui-modal>
    </transition>
  </teleport>
  <button class="tw-w-full tw-py-4 tw-text-brickSummerNight
  tw-font-oswald tw-uppercase
  hover:tw-bg-brickMediumGreen hover:tw-text-white
  focus:tw-outline-none active:tw-outline-none
  tw-transition-background tw-duration-200 tw-ease-in-out"
  @click="openMap">See details</button>

</article>
<teleport to="body">
  <transition name="fade">
<ui-modal v-if="showMap" @close="closeMap">
    <img class="tw-object-contain tw-max-w-7xl" :src="parkLocationImgURL" />
    <div class="tw-text-center tw-bg-brickLightGreen tw-p-8 tw-text-4">
      <h3><span class="tw-font-oswald tw-font-bold">Brick Location:</span> {{ parkLocation }}</h3>
      <h3><span class="tw-font-oswald tw-font-bold">Brick Inscription:</span> {{ brick.inscription }}</h3>
    </div>
</ui-modal>
  </transition>
</teleport>
</template>

<script>
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
h3 {
  font-size: 2rem;
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
