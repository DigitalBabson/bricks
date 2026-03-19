<template>
  <div
    ref="brickGrid"
    class="
      bricks
      tw-container xl:tw-max-w-brickMWL
      tw-mx-auto
      tw-px-8
      md:tw-px-12
      lg:tw-px-brick20
      xl:tw-px-0
      tw-grid tw-grid-cols-2
      lg:tw-grid-cols-4
      tw-gap-brick3
      md:tw-gap-brick5
      lg:tw-gap-13
    "
  >
    <brick-card v-for="brick in bricks" :key="brick.id" :brick="brick" />
  </div>
  <h3
    class="tw-container tw-mx-auto tw-max-w-6xl msg_no_results tw-text-3xl"
    v-if="showMessage == true"
  >
    No bricks match your criteria
  </h3>
  <pagination
    :currentPage="currentPage"
    :totalPages="totalPages"
    @update:page="goToPage"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue"
import type { PropType } from "vue"
import axios from "axios";
import BrickCard from "./BrickCard.vue";
import Pagination from "./Pagination.vue";
import { defaultEnvKey, defaultUrlKey, searchstaxEndpointKey, searchstaxTokenKey } from "../types/index"
import type { Brick, BrickApiResponse, FileApiItem, ParkLocation } from "../types/index"
import { searchBricks } from "../services/searchstax"

export default defineComponent({
  components: {
    BrickCard,
    Pagination,
  },
  props: {
    inscription: { type: String, default: '' },
    locationIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    locations: {
      type: Array as PropType<ParkLocation[]>,
      default: () => [],
    },
  },
  emits: [],
  data() {
    return {
      bricks: [] as Brick[],
      currentPage: 1,
      totalPages: 1,
      pageSize: 20,
      showMessage: false,
      searchTimeout: null as ReturnType<typeof setTimeout> | null,
    };
  },
  inject: {
    defaultEnv: { from: defaultEnvKey, default: '' },
    defaultUrl: { from: defaultUrlKey, default: '' },
    searchstaxEndpoint: { from: searchstaxEndpointKey, default: '' },
    searchstaxToken: { from: searchstaxTokenKey, default: '' },
  },
  computed: {
    apiUrl(): string {
      return this.defaultUrl as string;
    },
  },
  watch: {
    inscription(value: string) {
      this.currentPage = 1;

      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = null;
      }

      if (value.length === 0) {
        this.fetchBricks();
      } else if (value.length >= 3) {
        this.searchTimeout = setTimeout(() => {
          this.searchTimeout = null;
          this.fetchBricks();
        }, 500);
      }
    },
    locationIds: {
      handler() {
        this.currentPage = 1;
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
          this.searchTimeout = null;
        }
        this.fetchBricks();
      },
      deep: true,
    },
    locations: {
      handler() {
        if (this.bricks.length > 0 && this.locations.length > 0) {
          this.bricks = this.decorateBricksWithLocations(this.bricks);
        }
      },
      deep: true,
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
      const placeholderPath = import.meta.env.DEV_PLACEHOLDER_IMAGE
        || '/sites/default/files/images/bricks/coming-soon-gray.jpg';
      return this.normalizeDrupalAssetPath(placeholderPath);
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
    buildDrupalImageQuery(): string {
      return '&include=field_brick_image' +
        '&fields[brick]=field_brick_inscription,field_brick_image,field_brick_zone' +
        '&fields[file--file]=uri,url,image_style_uri';
    },
    resolveAssetUrl(url?: string): string | undefined {
      if (!url) {
        return undefined;
      }

      if (url.startsWith('http')) {
        return url;
      }

      const env = this.defaultEnv as string;
      return env ? `${env}${url}` : url;
    },
    buildFileHydrationUrl(fileIds: string[]): string {
      const filters = fileIds
        .map((fileId, index) =>
          `&filter[id-filter][condition][value][${index}]=${encodeURIComponent(fileId)}`
        )
        .join('');

      return this.apiUrl +
        'file/file' +
        '?filter[id-filter][condition][path]=id' +
        '&filter[id-filter][condition][operator]=IN' +
        filters +
        '&fields[file--file]=uri,url,image_style_uri';
    },
    getLocationDetails(locationId: string) {
      return this.locations.find((location) => location.id === locationId);
    },
    decorateBricksWithLocations(bricks: Brick[]): Brick[] {
      return bricks.map((brick) => {
        const location = this.getLocationDetails(brick.brickParkLocation);
        return {
          ...brick,
          parkLocationName: location?.name ?? brick.parkLocationName,
          parkLocationImgURL: location?.mapImageUrl ?? brick.parkLocationImgURL,
        };
      });
    },
    buildBrickFromDrupalItem(
      brickItem: BrickApiResponse['data'][number],
      includedFiles: Map<string, NonNullable<BrickApiResponse['included']>[number]>
    ): Brick {
      const brickImage: string = brickItem.relationships.field_brick_image.data == null
        ? 'default'
        : brickItem.relationships.field_brick_image.data.id;
      const imageFile = brickImage === 'default' ? undefined : includedFiles.get(brickImage);
      const isPlaceholderImage = brickImage === 'default' || this.isDefaultDrupalImage(brickImage, imageFile);
      const previewUrl = this.resolveAssetUrl(
        imageFile?.attributes?.image_style_uri?.brick_preview ??
        imageFile?.attributes?.image_style_uri?.brick ??
        imageFile?.attributes?.uri?.url
      );
      const fullUrl = this.resolveAssetUrl(
        imageFile?.attributes?.image_style_uri?.brick_large ??
        imageFile?.attributes?.image_style_uri?.full_img ??
        imageFile?.attributes?.uri?.url
      );
      const brickParkLocation = brickItem.relationships.field_brick_zone.data?.id ?? '';
      const location = this.getLocationDetails(brickParkLocation);

      return {
        id: brickItem.id,
        inscription: brickItem.attributes.field_brick_inscription,
        brickImage,
        isPlaceholderImage,
        brickParkLocation,
        brickImagePreviewUrl: isPlaceholderImage ? undefined : previewUrl,
        brickImageFullUrl: isPlaceholderImage ? undefined : fullUrl,
        parkLocationName: location?.name,
        parkLocationImgURL: location?.mapImageUrl,
      };
    },
    async hydrateSearchstaxBricks(bricks: Brick[]): Promise<Brick[]> {
      const imageIds = Array.from(
        new Set(
          bricks
            .map((brick) => brick.brickImage)
            .filter((imageId) => imageId && imageId !== 'default')
        )
      );

      const imageFiles = new Map<string, FileApiItem>();

      if (imageIds.length > 0) {
        const response = await axios.get<{ data: FileApiItem[] }>(
          this.buildFileHydrationUrl(imageIds)
        );

        for (const file of response.data.data) {
          if (file?.id && file.attributes) {
            imageFiles.set(file.id, file);
          }
        }
      }

      const hydratedBricks = bricks.map((brick) => {
        const imageFile = imageFiles.get(brick.brickImage);
        const isPlaceholderImage = brick.brickImage === 'default' || this.isDefaultDrupalImage(brick.brickImage, imageFile);
        const previewUrl = this.resolveAssetUrl(
          imageFile?.attributes?.image_style_uri?.brick_preview ??
          imageFile?.attributes?.image_style_uri?.brick ??
          imageFile?.attributes?.uri?.url
        );
        const fullUrl = this.resolveAssetUrl(
          imageFile?.attributes?.image_style_uri?.brick_large ??
          imageFile?.attributes?.image_style_uri?.full_img ??
          imageFile?.attributes?.uri?.url
        );
        const location = this.getLocationDetails(brick.brickParkLocation);

        return {
          ...brick,
          isPlaceholderImage,
          brickImagePreviewUrl: isPlaceholderImage ? undefined : previewUrl,
          brickImageFullUrl: isPlaceholderImage ? undefined : fullUrl,
          parkLocationName: location?.name,
          parkLocationImgURL: location?.mapImageUrl,
        };
      });

      return this.decorateBricksWithLocations(hydratedBricks);
    },
    goToPage(page: number) {
      this.currentPage = page;
      this.fetchBricks();
    },
    buildUrl(offset: number): string {
      if (this.locationIds.length > 0) {
        const encodedIds = this.locationIds.map((locationId) => encodeURIComponent(locationId)).join(',')
        return this.apiUrl +
          `bricks?page[limit]=${this.pageSize}` +
          `&sort=field_sort_alpha` +
          `&filter[field_brick_zone.id][operator]=IN` +
          `&filter[field_brick_zone.id][value]=${encodedIds}` +
          this.buildDrupalImageQuery() +
          `&page[offset]=${offset}`;
      }

      return this.apiUrl +
        `bricks?page[limit]=${this.pageSize}` +
        `&page[offset]=${offset}` +
        this.buildDrupalImageQuery() +
        `&sort=field_sort_alpha`;
    },
    async fetchViaSearchstax() {
      const offset = (this.currentPage - 1) * this.pageSize;

      const result = await searchBricks({
        endpoint: this.searchstaxEndpoint as string,
        token: this.searchstaxToken as string,
        keyword: this.inscription,
        locationIds: this.locationIds.length > 0 ? this.locationIds : undefined,
        pageSize: this.pageSize,
        offset,
      });

      const hydratedBricks = await this.hydrateSearchstaxBricks(result.bricks);
      this.bricks = hydratedBricks;
      this.showMessage = hydratedBricks.length === 0;
      this.totalPages = Math.ceil(result.numFound / this.pageSize) || 1;
    },
    async fetchViaDrupalKeyword() {
      const offset = (this.currentPage - 1) * this.pageSize;

      let url = this.apiUrl +
        `bricks?page[limit]=${this.pageSize}` +
        `&filter[field_brick_inscription][operator]=CONTAINS` +
        `&filter[field_brick_inscription][value]=${encodeURIComponent(this.inscription)}` +
        this.buildDrupalImageQuery() +
        `&page[offset]=${offset}` +
        `&sort=field_sort_alpha`;

      if (this.locationIds.length > 0) {
        const encodedIds = this.locationIds.map((id) => encodeURIComponent(id)).join(',');
        url += `&filter[field_brick_zone.id][operator]=IN` +
               `&filter[field_brick_zone.id][value]=${encodedIds}`;
      }

      const response = await axios.get<BrickApiResponse>(url);
      this.parseDrupalResponse(response.data);
    },
    parseDrupalResponse(responseData: BrickApiResponse) {
      const includedFiles = new Map(
        (responseData.included ?? [])
          .filter((item) => item.type === 'file--file')
          .map((item) => [item.id, item])
      );

      const data: Brick[] = responseData.data.map((brickItem) => this.buildBrickFromDrupalItem(brickItem, includedFiles));

      const hasActiveFilter = this.locationIds.length > 0 || this.inscription.length >= 3;
      this.showMessage = hasActiveFilter && data.length === 0;
      this.bricks = data;

      const totalCount = responseData.meta?.count ?? 0;
      this.totalPages = Math.ceil(totalCount / this.pageSize) || 1;
    },
    async fetchBricks() {
      try {
        const hasKeyword = this.inscription.length >= 3;

        if (hasKeyword) {
          try {
            await this.fetchViaSearchstax();
            return;
          } catch {
            console.warn('SearchStax unavailable, falling back to Drupal keyword search');
          }

          await this.fetchViaDrupalKeyword();
          return;
        }

        // Non-keyword paths (default browse, location-only) — always Drupal
        const offset = (this.currentPage - 1) * this.pageSize;
        const url = this.buildUrl(offset);
        const response = await axios.get<BrickApiResponse>(url);
        this.parseDrupalResponse(response.data);

        // Scroll grid to top on page change
        if (this.currentPage > 1) {
          this.$nextTick(() => {
            const grid = this.$refs.brickGrid as HTMLElement | undefined;
            grid?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
          });
        }
      } catch {
        this.bricks = [];
        this.totalPages = 1;
        this.showMessage = this.locationIds.length > 0 || this.inscription.length >= 3;
      }
    },
  },
  beforeUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
  mounted() {
    this.fetchBricks();
  },
});
</script>
