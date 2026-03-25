<template>
  <article
    class="
      brick-card tw-cursor-default tw-shadow-brickCard tw-text-center
    "
  >
    <div
      class="brick-card__media tw-group tw-cursor-pointer focus-visible:tw-ring-2 focus-visible:tw-ring-brickSummerNight"
      tabindex="0"
      role="button"
      :aria-label="`Enlarge brick image: ${brick?.inscription || 'Brick'}`"
      @click="handleImageClick"
      @keydown.enter.prevent="handleImageClick"
      @keydown.space.prevent="handleImageClick"
    >
      <div
        v-if="showPlaceholder"
        class="brick-card__placeholder"
        role="img"
        aria-label="Image loading"
      ></div>

      <img
        v-if="thumbnailUrl"
        class="
          tw-transition-opacity tw-duration-200 tw-ease-in-out
          brick-card__image
        "
        :class="showPlaceholder ? 'brick-card__image--loading' : ''"
        :src="thumbnailUrl"
        :alt="brick?.inscription || 'Brick image'"
        loading="lazy"
        @load="onImgLoad"
        @error="onImgError"
      />

      <div
        v-if="showComingSoonOverlay"
        class="
          tw-absolute tw-inset-x-4 tw-inset-y-10 tw-flex tw-items-center tw-justify-center
        "
      >
        <div
          class="
            tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center
            tw-bg-white/70 tw-px-5 tw-py-4 tw-text-center
            tw-shadow-[0_0_24px_rgba(255,255,255,0.35)]
          "
        >
          <p
            class="
              tw-font-oswald tw-uppercase tw-text-[16px] tw-text-black tw-leading-tight
            "
          >
            {{ brick.inscription }}
          </p>
          <div class="tw-my-3 tw-h-px tw-w-full tw-bg-brickBabsonGrey/35"></div>
          <p class="tw-font-oswald tw-text-[16px] tw-text-black">
            Image Coming Soon
          </p>
        </div>
      </div>

      <div
        v-else
        class="
          tw-pointer-events-none tw-absolute tw-inset-0 tw-bg-white/40 tw-opacity-0
          tw-transition-opacity tw-duration-200
          group-hover:tw-opacity-100 group-focus-within:tw-opacity-100
        "
      ></div>

      <button
        v-if="!showComingSoonOverlay"
        class="
          tw-absolute tw-right-0 tw-top-0 tw-z-10 tw-bg-white/70 tw-px-3 tw-py-3
          tw-font-oswald tw-text-base tw-uppercase tw-text-black
          tw-transition-all tw-duration-200
          md:tw-opacity-0
          group-hover:tw-opacity-100 group-focus-within:tw-opacity-100
          hover:tw-bg-black hover:tw-text-white
          focus-visible:tw-bg-black focus-visible:tw-text-white
          focus-visible:tw-opacity-100 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-white
        "
        tabindex="-1"
        aria-label="Enlarge brick image"
        @click.stop="openImg"
      >
        <span class="tw-hidden md:tw-inline">Enlarge Brick </span><i class="fa-solid fa-up-right-and-down-left-from-center md:tw-ml-2"></i>
      </button>
    </div>
    <transition name="fade">
      <ui-modal v-if="showImg" :label="`Brick image: ${brick.inscription}`" @close="closeImg">
        <img class="tw-object-contain tw-max-h-90vh" :src="brickImgUrl" />
      </ui-modal>
    </transition>
    <button
      class="
        tw-w-full tw-cursor-pointer tw-py-4 tw-text-brickCourtyardGreen tw-font-oswald tw-uppercase
        hover:tw-bg-brickMediumGreen hover:tw-text-white
        focus-visible:tw-bg-brickMediumGreen focus-visible:tw-text-white
        tw-transition-colors tw-duration-200 tw-ease-in-out
      "
      @click.stop="openMap"
    >
      View location details
    </button>
  </article>
  <transition name="fade">
    <ui-modal v-if="showMap" :label="`Location map: ${brick.inscription}`" @close="closeMap">
      <div class="brick__map-wrapper tw-mx-auto tw-table">
        <img
          v-if="parkLocationImgURL"
          class="tw-object-contain tw-max-w-full tw-max-h-[calc(90vh_-_160px)] md:tw-max-h-[calc(80vh_-_160px)]"
          :src="parkLocationImgURL"
        />
        <div
          class="brick__map-caption tw-table-caption tw-bg-white tw-px-6 tw-py-4 tw-text-left"
        >
          <div class="tw-mb-2">
            <span class="tw-font-oswald tw-text-[18px] tw-text-black tw-mr-1">Brick Location:</span>
            <span class="tw-font-zilla tw-text-[19px] tw-text-black">{{ parkLocation }}</span>
          </div>
          <div>
            <span class="tw-font-oswald tw-text-[18px] tw-text-black tw-mr-1">Brick Inscription:</span>
            <span class="tw-font-zilla tw-text-[19px] tw-text-black">{{ brick.inscription }}</span>
          </div>
        </div>
      </div>
    </ui-modal>
  </transition>
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
      hasMissingImage: false,
      isFetchingLocation: false,
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
    isComingSoon(): boolean {
      return !this.brick.brickImage || this.brick.brickImage === "default";
    },
    hasConfiguredMissingImage(): boolean {
      return this.isComingSoon || !!this.brick.isPlaceholderImage;
    },
    showComingSoonOverlay(): boolean {
      return this.hasConfiguredMissingImage || this.hasMissingImage;
    },
    showPlaceholder() {
      return this.isImgLoading;
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
    getPlaceholderImageUuid(): string {
      return import.meta.env.DEV_PLACEHOLDER_IMAGE_UUID ?? '';
    },
    normalizeDrupalAssetPath(value?: string): string {
      if (!value) {
        return '';
      }

      const withoutQuery = value.split('?')[0];
      if (withoutQuery.startsWith('public://')) {
        return `/sites/default/files/${withoutQuery.slice('public://'.length)}`;
      }

      try {
        return new URL(withoutQuery).pathname;
      } catch {
        return withoutQuery;
      }
    },
    getPlaceholderImagePath(): string {
      return this.normalizeDrupalAssetPath(this.defaultImgPath);
    },
    isDefaultDrupalImage(
      fileId?: string,
      file?: { attributes?: { uri?: { value?: string; url?: string } } }
    ): boolean {
      const placeholderUuid = this.getPlaceholderImageUuid();
      if (placeholderUuid && fileId === placeholderUuid) {
        return true;
      }

      if (!file?.attributes) {
        return false;
      }

      const placeholderPath = this.getPlaceholderImagePath();
      if (!placeholderPath) {
        return false;
      }

      const candidates = [
        this.normalizeDrupalAssetPath(file.attributes.uri?.value),
        this.normalizeDrupalAssetPath(file.attributes.uri?.url),
      ];

      return candidates.some((value) => value === placeholderPath);
    },
    handleImageClick() {
      if (this.showComingSoonOverlay) {
        return;
      }

      this.openImg();
    },
    openMap() {
      if (!this.parkLocation && this.brick.parkLocationName) {
        this.parkLocation = this.brick.parkLocationName;
      }
      if (!this.parkLocationImgURL && this.brick.parkLocationImgURL) {
        this.parkLocationImgURL = this.brick.parkLocationImgURL;
      }

      this.showMap = true;

      if ((!this.parkLocation || !this.parkLocationImgURL) && !this.isFetchingLocation) {
        this.getParkLocationImgURL();
      }
    },
    closeMap() {
      this.showMap = false;
    },
    openImg() {
      if (this.showComingSoonOverlay) {
        return;
      }

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
      this.hasMissingImage = true;
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
      this.hasMissingImage = false;

      if (this.hasConfiguredMissingImage) {
        this.hasMissingImage = true;
        const fallback = this.fallbackImgUrl;
        this.thumbnailUrl = fallback;
        this.brickImgUrl = fallback;
        this.isImgLoading = false;
        return;
      }

      if (this.brick.brickImagePreviewUrl && this.brick.brickImageFullUrl) {
        this.thumbnailUrl = this.brick.brickImagePreviewUrl;
        this.brickImgUrl = this.brick.brickImageFullUrl;
        // For cached images the browser may not fire @load — clear loading state if already complete
        this.$nextTick(() => {
          const imgEl = this.$el?.querySelector?.('img.brick-card__image') as HTMLImageElement | undefined;
          if (imgEl?.complete) {
            this.isImgLoading = false;
          }
        });
        return;
      }

      try {
        const url = this.apiUrl + `file/file/` + this.brick.brickImage + `?fields[file--file]=uri,url,image_style_uri`;
        const response = await axios.get<MediaImageApiResponse>(url);
        const file = response?.data?.data;
        if (this.isDefaultDrupalImage(this.brick.brickImage, file)) {
          this.hasMissingImage = true;
          const fallback = this.fallbackImgUrl;
          this.thumbnailUrl = fallback;
          this.brickImgUrl = fallback;
          this.isImgLoading = false;
          return;
        }

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
          this.hasMissingImage = false;
        } else {
          this.hasMissingImage = true;
          const fallback = this.fallbackImgUrl;
          this.thumbnailUrl = fallback;
          this.brickImgUrl = fallback;
          this.isImgLoading = false;
        }
      } catch {
        this.hasMissingImage = true;
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

      this.isFetchingLocation = true;
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
      } finally {
        this.isFetchingLocation = false;
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
  animation: brick-card-pulse 1.2s ease-in-out infinite;
}
.brick-card__image {
  display: block;
  width: 100%;
  height: auto;
}
.brick-card__image--loading {
  inset: 0;
  height: 100%;
  opacity: 0;
  position: absolute;
}

</style>
