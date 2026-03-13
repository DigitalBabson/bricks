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
        :alt="brick?.inscription || 'Brick image'"
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
        tw-w-full tw-py-4 tw-text-brickCourtyardGreen tw-font-oswald tw-uppercase
        hover:tw-bg-brickMediumGreen hover:tw-text-white
        focus:tw-outline-none
        active:tw-outline-none
        tw-transition-background tw-duration-200 tw-ease-in-out
      "
      @click="openMap"
    >
      View location details
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

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import UiModal from "./UiModal.vue";
import axios from "axios";
import { defaultEnvKey, defaultUrlKey } from "../types/index"
import type { Brick, MediaImageApiResponse, ParkLocationApiResponse } from "../types/index"

export default defineComponent({
  props: {
    brick: { type: Object as PropType<Brick>, required: true }
  },
  data() {
    return {
      showMap: false,
      showImg: false,
      brickImgUrl: "",
      thumbnailUrl: "",
      parkLocationImgURL: "",
      parkLocation: "",
      isImgLoading: true,
      defaultImgPath: import.meta.env.DEV_PLACEHOLDER_IMAGE
        || '/sites/default/files/2026-03/coming-soon-gray.jpg',
    };
  },
  inject: {
    defaultEnv: { from: defaultEnvKey, default: '' },
    defaultUrl: { from: defaultUrlKey, default: '' }
  },
  components: {
    UiModal,
  },
  computed: {
    showPlaceholder() {
      // Show placeholder only while loading before any image is ready
      return this.isImgLoading && !this.brickImgUrl;
    },
    env(): string {
      return this.defaultEnv as string;
    },
    apiUrl(): string {
      return this.defaultUrl as string;
    },
    fallbackImgUrl(): string {
      // If defaultImgPath is already a full URL (from env var), use it directly
      if (this.defaultImgPath.startsWith('http')) {
        return this.defaultImgPath;
      }
      return this.env + this.defaultImgPath;
    },
  },
  methods: {
    openMap() {
      if (!this.parkLocation && this.brick.parkLocationName) {
        this.parkLocation = this.brick.parkLocationName;
      }
      if (!this.parkLocationImgURL && this.brick.parkLocationImgURL) {
        this.parkLocationImgURL = this.brick.parkLocationImgURL;
      }

      this.showMap = true;

      if (!this.parkLocation || !this.parkLocationImgURL) {
        this.getParkLocationImgURL();
      }
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
    },
    onImgError() {
      this.isImgLoading = false;
      const fallback = this.fallbackImgUrl;
      this.thumbnailUrl = fallback;
      this.brickImgUrl = fallback;
    },
    resolveAssetUrl(url?: string) {
      if (!url) {
        return "";
      }

      if (url.startsWith('http')) {
        return url;
      }

      return this.env + url;
    },
    async getBrickImgURL() {
      this.isImgLoading = true;

      if (this.brick.brickImagePreviewUrl && this.brick.brickImageFullUrl) {
        this.thumbnailUrl = this.brick.brickImagePreviewUrl;
        this.brickImgUrl = this.brick.brickImageFullUrl;
        this.isImgLoading = false;
        return;
      }

      // If brick image is explicitly default/missing, use default and stop
      if (!this.brick.brickImage || this.brick.brickImage === "default") {
        const fallback = this.fallbackImgUrl;
        this.thumbnailUrl = fallback;
        this.brickImgUrl = fallback;
        this.isImgLoading = false;
        return;
      }

      try {
        const url = this.apiUrl + `file/file/` + this.brick.brickImage + `?fields[file--file]=uri,url,image_style_uri`;
        const response = await axios.get<MediaImageApiResponse>(url);
        const imageData = response?.data?.data?.attributes?.image_style_uri;
        const previewUrl = this.resolveAssetUrl(
          imageData?.brick_preview ?? imageData?.brick ?? response?.data?.data?.attributes?.uri?.url
        );
        const fullUrl = this.resolveAssetUrl(
          imageData?.brick_large ?? imageData?.full_img ?? response?.data?.data?.attributes?.uri?.url
        );

        if (previewUrl && fullUrl) {
          this.thumbnailUrl = previewUrl;
          this.brickImgUrl = fullUrl;
          this.isImgLoading = false;
        } else {
          const fallback = this.fallbackImgUrl;
          this.thumbnailUrl = fallback;
          this.brickImgUrl = fallback;
          this.isImgLoading = false;
        }
      } catch {
        const fallback = this.fallbackImgUrl;
        this.thumbnailUrl = fallback;
        this.brickImgUrl = fallback;
        this.isImgLoading = false;
      }
    },
    async getParkLocationImgURL() {
      if (this.brick.parkLocationName && this.brick.parkLocationImgURL) {
        this.parkLocation = this.brick.parkLocationName;
        this.parkLocationImgURL = this.brick.parkLocationImgURL;
        return;
      }

      try {
        const url = this.apiUrl +
          `parkLocations/` +
          this.brick.brickParkLocation +
          `?include=field_brick_zone_image,field_brick_zone_image.field_media_image` +
          `&fields[parkLocation]=name,field_brick_zone_image` +
          `&fields[media--image]=field_media_image` +
          `&fields[file--file]=uri,url,image_style_uri`;
        const response = await axios.get<ParkLocationApiResponse>(url);
        this.parkLocation = response?.data?.data?.attributes?.name || "";

        const included = response?.data?.included ?? [];
        const mediaId = response?.data?.data?.relationships?.field_brick_zone_image?.data?.id;
        const media = mediaId
          ? included.find((item) => item.type === 'media--image' && item.id === mediaId)
          : undefined;
        const fileId = media?.relationships?.field_media_image?.data?.id;
        const file = fileId
          ? included.find((item) => item.type === 'file--file' && item.id === fileId)
          : undefined;

        this.parkLocationImgURL = this.resolveAssetUrl(
          file?.attributes?.image_style_uri?.brick_large ??
          file?.attributes?.image_style_uri?.full_img ??
          file?.attributes?.uri?.url
        );
      } catch {
        this.parkLocation = "";
        this.parkLocationImgURL = "";
      }
    },
  },
  mounted() {
    this.getBrickImgURL();
    if (this.brick.parkLocationName) {
      this.parkLocation = this.brick.parkLocationName;
    }
    if (this.brick.parkLocationImgURL) {
      this.parkLocationImgURL = this.brick.parkLocationImgURL;
    }
  },
})
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
