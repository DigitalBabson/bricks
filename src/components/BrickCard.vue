<template>
  <article class="brick-card tw-shadow-brickCard tw-text-center">
    <img
      class="
        tw-cursor-pointer
        hover:tw-opacity-50
        tw-transition-opacity tw-duration-200 tw-ease-in-out
      "
      :src="thumbnailUrl"
      @click="openImg"
    />
    <teleport to="body">
      <transition name="fade">
        <ui-modal v-if="showImg" @close="closeImg">
          <img class="tw-object-contain tw-max-h-90vh" :src="brickImgUrl" />
        </ui-modal>
      </transition>
    </teleport>
    <button
      class="
        tw-w-full tw-py-4 tw-text-brickSummerNight tw-font-oswald tw-uppercase
        hover:tw-bg-brickMediumGreen hover:tw-text-white
        focus:tw-outline-none
        active:tw-outline-none
        tw-transition-background tw-duration-200 tw-ease-in-out
      "
      @click="openMap"
    >
      See location details
    </button>
  </article>
  <teleport to="body">
    <transition name="fade">
      <ui-modal v-if="showMap" @close="closeMap">
        <div class="brick__map-wrapper tw-mx-auto tw-table">
          <img
            class="
              tw-object-contain tw-max-w-full tw-max-h-80vh
              lg:tw-max-h-70vh
            "
            :src="parkLocationImgURL"
          />
          <div
            class="
              brick__map-caption
              tw-table-caption
              md:tw-text-center
              tw-bg-brickLightGreen tw-p-8
            "
          >
            <div>
              <span class="tw-font-oswald tw-text-brickL tw-mr-3">Brick Location:</span>
              <span
                class="tw-font-zilla tw-text-brickL tw-text-brickBabsonGrey"
                >{{ parkLocation }}</span
              >
            </div>
            <div>
              <span class="tw-font-oswald tw-text-brickL tw-mr-3"
                >Brick Inscription:</span
              >
              <span
                class="tw-font-zilla tw-text-brickL tw-text-brickBabsonGrey"
                >{{ brick.inscription }}</span
              >
            </div>
          </div>
        </div>
      </ui-modal>
    </transition>
  </teleport>
</template>

<script>
import UiModal from "./UiModal.vue";
import axios from "axios";
export default {
  props: ["brick"],
  data() {
    return {
      showMap: false,
      showImg: false,
      brickImgUrl: "",
      thumbnailUrl: "",
      parkLocationImgURL: "",
      parkLocation: "",
    };
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
      if (this.brick.brickImage == "default") {
        this.thumbnailUrl =
          this.defaultEnv + "/sites/default/files/2022-09/coming-soon.jpg?v2";
        this.brickImgUrl =
          this.defaultEnv + "/sites/default/files/2022-09//coming-soon.jpg?v2";
      } else {
        const url = this.defaultUrl + `media/image/`;
        //axios.defaults.withCredentials = true;
        const response = await axios.get(
          url + this.brick.brickImage,
          {},
          {
            headers: {
              crossDomain: true,
              "Content-Type": "application/json",
            },
            // auth: {
            //   username: babson,
            //   password: drupal9
            // }
          }
        );
        this.thumbnailUrl =
          response.data.included[0].attributes.image_style_uri.find(
            ({ brick }) => brick
          ).brick;
        this.brickImgUrl =
          response.data.included[0].attributes.image_style_uri.find(
            ({ full_img }) => full_img
          ).full_img;
      }
      //this.brickImgUrl = this.defaultEnv + response.data.included[0].attributes.uri.url + '?' + this.file_token;
    },
    async getParkLocationImgURL() {
      const url =
        this.defaultUrl + `parkLocations/` + this.brick.brickParkLocation;
      //axios.defaults.withCredentials = true;
      const response = await axios.get(
        url,
        {},
        {
          headers: {
            crossDomain: true,
            "Content-Type": "application/json",
          },
          // auth: {
          //   username: babson,
          //   password: drupal9
          // }
        }
      );
      this.parkLocation = response.data.data.attributes.name;
      this.parkLocationImgURL =
        response.data.included[1].attributes.image_style_uri.find(
          ({ full_img }) => full_img
        ).full_img;

      //this.parkLocationImgURL = this.defaultEnv + response.data.included[1].attributes.uri.url + '?' + this.file_token;
    },
  },
  mounted() {
    this.getBrickImgURL();
    this.getParkLocationImgURL();
  },
};
</script>

<style scoped>
h3 {
  font-size: 2rem;
}
.brick__map-caption {
  caption-side: bottom;
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
