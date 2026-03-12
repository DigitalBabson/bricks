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
import { defaultEnvKey, defaultUrlKey } from "../types/index"
import type { Brick, BrickApiResponse } from "../types/index"

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
  },
  emits: ['update:totalCount'],
  data() {
    return {
      bricks: [] as Brick[],
      currentPage: 1,
      totalPages: 1,
      pageSize: 20,
      showMessage: false
    };
  },
  inject: {
    defaultEnv: { from: defaultEnvKey, default: '' },
    defaultUrl: { from: defaultUrlKey, default: '' }
  },
  computed: {
    apiUrl(): string {
      return this.defaultUrl as string;
    },
  },
  watch: {
    inscription(value: string) {
      this.currentPage = 1;
      if (value.length === 0) {
        this.fetchBricks();
      } else if (value.length >= 3 && this.locationIds.length === 0) {
        this.fetchBricks();
      }
    },
    locationIds: {
      handler() {
        this.currentPage = 1;
        this.fetchBricks();
      },
      deep: true,
    },
  },
  methods: {
    goToPage(page: number) {
      this.currentPage = page;
      this.fetchBricks();
    },
    buildUrl(offset: number): string {
      if (this.locationIds.length > 0) {
        const encodedIds = this.locationIds.map((locationId) => encodeURIComponent(locationId)).join(',')
        return this.apiUrl +
          `bricks?page[limit]=${this.pageSize}` +
          `&sort=brickInscription` +
          `&filter[brickParkLocation.id][operator]=IN` +
          `&filter[brickParkLocation.id][value]=${encodedIds}` +
          `&page[offset]=${offset}`;
      }

      if (this.inscription.length >= 3) {
        return this.apiUrl +
          `bricks?page[limit]=${this.pageSize}` +
          `&filter[brickInscription][operator]=CONTAINS` +
          `&filter[brickInscription][value]=${encodeURIComponent(this.inscription)}` +
          `&page[offset]=${offset}` +
          `&sort=brickInscription`;
      }

      return this.apiUrl +
        `bricks?page[limit]=${this.pageSize}` +
        `&page[offset]=${offset}` +
        `&sort=brickInscription`;
    },
    async fetchBricks() {
      try {
        const offset = (this.currentPage - 1) * this.pageSize;
        const url = this.buildUrl(offset);
        const response = await axios.get<BrickApiResponse>(url);
        const results = response.data.data;
        const data: Brick[] = results.map((bricks) => {
          const brickImage: string = bricks.relationships.brickImage.data == null
            ? 'default'
            : bricks.relationships.brickImage.data.id;
          return {
            id: bricks.id,
            number: bricks.attributes.brickNumber,
            inscription: bricks.attributes.brickInscription,
            brickImage,
            brickParkLocation: bricks.relationships.brickParkLocation.data?.id ?? '',
          }
        });

        const hasActiveFilter = this.locationIds.length > 0 || this.inscription.length >= 3;
        this.showMessage = hasActiveFilter && data.length === 0;

        // Replace bricks array (not append)
        this.bricks = data;

        // Calculate total pages from meta.count
        const totalCount = response.data.meta?.count ?? 0;
        this.totalPages = Math.ceil(totalCount / this.pageSize) || 1;
        this.$emit('update:totalCount', totalCount);

        // Scroll grid to top on page change
        if (this.currentPage > 1) {
          this.$nextTick(() => {
            const grid = this.$refs.brickGrid as HTMLElement | undefined;
            grid?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
          });
        }
      } catch {
        // Silently handle fetch errors — UI will show empty state
        this.bricks = [];
        this.totalPages = 1;
        this.showMessage = this.locationIds.length > 0 || this.inscription.length >= 3;
        this.$emit('update:totalCount', 0);
      }
    },
  },
  mounted() {
    this.fetchBricks();
  },
});
</script>
