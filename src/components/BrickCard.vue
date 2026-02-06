<template>
  <article class="brick-card tw-shadow-brickCard tw-text-center">
    <div class="brick-card__media">
      <div
        v-if="showPlaceholder"
        class="brick-card__placeholder"
        role="img"
        aria-label="Image loading"
      ></div>

      <img
        v-else
        class="
          tw-cursor-pointer
          hover:tw-opacity-50
          tw-transition-opacity tw-duration-200 tw-ease-in-out
          brick-card__image
        "
        :src="thumbnailUrl"
        :alt="brick?.title || 'Brick image'"
        loading="lazy"
        @load="onImgLoad"
        @error="onImgError"
        @click="openImg"
      />
    </div>
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
      isImgLoading: true,
      hasImgError: false,
      defaultImgPath: "/sites/default/files/2025-10/coming-soon.jpg",
    };
  },
  inject: ["defaultEnv", "defaultUrl"],
  components: {
    UiModal,
  },
  computed: {
    showPlaceholder() {
      // Show placeholder only while loading before any image is ready
      return this.isImgLoading && !this.brickImgUrl;
    },
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
    onImgLoad() {
      this.isImgLoading = false;
      this.hasImgError = false;
    },
    onImgError() {
      this.isImgLoading = false;
      const fallback = this.defaultEnv + this.defaultImgPath;
      this.thumbnailUrl = fallback;
      this.brickImgUrl = fallback;
      this.hasImgError = false; // Allow default to render
    },
    async getBrickImgURL() {
      this.isImgLoading = true;
      this.hasImgError = false;

      // If brick image is explicitly default/missing, use default and stop
      if (!this.brick.brickImage || this.brick.brickImage === "default") {
        const fallback = this.defaultEnv + this.defaultImgPath;
        this.thumbnailUrl = fallback;
        this.brickImgUrl = fallback;
        this.isImgLoading = false;
        this.hasImgError = false; // show default immediately
        return;
      }

      try {
        const url = this.defaultUrl + `media/image/`;
        const response = await axios.get(
          url + this.brick.brickImage,
          {
            headers: {
              crossDomain: true,
              "Content-Type": "application/json",
            },
          }
        );

        const imageData = response?.data?.included?.[0]?.attributes?.image_style_uri;
        if (imageData?.brick && imageData?.full_img) {
          this.thumbnailUrl = imageData.brick;
          this.brickImgUrl = imageData.full_img;
          this.isImgLoading = false;
          this.hasImgError = false;
        } else {
          const fallback = this.defaultEnv + this.defaultImgPath;
          this.thumbnailUrl = fallback;
          this.brickImgUrl = fallback;
          this.isImgLoading = false;
          this.hasImgError = false; // allow default to render
        }
      } catch (error) {
        const fallback = this.defaultEnv + this.defaultImgPath;
        this.thumbnailUrl = fallback;
        this.brickImgUrl = fallback;
        this.isImgLoading = false;
        this.hasImgError = false; // allow default to render
      }
    },
    async getParkLocationImgURL() {
      const url =
        this.defaultUrl + `parkLocations/` + this.brick.brickParkLocation;
      //axios.defaults.withCredentials = true;
      const response = await axios.get(
        url,
        {
          headers: {
            crossDomain: true,
            "Content-Type": "application/json",
          },
        }
      );
      this.parkLocation = response.data.data.attributes.name;
      this.parkLocationImgURL =
        response.data.included[1].attributes.image_style_uri.full_img;

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
.brick-card__media {
  position: relative;
}
.brick-card__placeholder {
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  background: repeating-linear-gradient(
    -45deg,
    rgba(0,0,0,0.06),
    rgba(0,0,0,0.06) 12px,
    rgba(0,0,0,0.10) 12px,
    rgba(0,0,0,0.10) 24px
  );
  border-radius: 4px;
  animation: brick-card-pulse 1.2s ease-in-out infinite;
}
.brick-card__image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 4px;
}

</style>
