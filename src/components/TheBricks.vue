<template>
  <brick-filter v-model:inscription="inscription" />
  <div
    class="
      bricks
      tw-container
      tw-mx-auto
      
      tw-grid tw-grid-cols-1
      md:tw-grid-cols-4
      tw-gap-5
    "
  >
    <brick-card v-for="brick in bricks" :key="brick.id" :brick="brick" />
  </div>
  <h3
    class="tw-container tw-mx-auto tw-max-w-6xl msg_no_results tw-text-3xl"
    v-if="bricks.length === 0"
  >
    No bricks match your criteria
  </h3>
  <pagination v-if="nextPage" @loadmore="loadMore" />
</template>

<script>
import axios from "axios";
import BrickCard from "./BrickCard.vue";
import BrickFilter from "./BrickFilter.vue";
import Pagination from "./Pagination.vue";

export default {
  components: {
    BrickCard,
    BrickFilter,
    Pagination,
  },
  data() {
    return {
      inscription: "",
      bricks: [],
      offset: 0,
      nextPage: false
    };
  },
  computed: {
    // filterBricksByName() {
    //   return this.bricks.filter((brick) =>
    //     brick.inscription
    //       .toString()
    //       .match(new RegExp(this.filter.inscription.trim().toString(), "i"))
    //   );
    //   return this.fetchBricks(filter.inscription)
    // },
  },
  watch: {
    inscription(value) {
      this.fetchBricks(value);
    },
  },
  methods: {

    loadMore() {
      this.fetchBricks(this.inscription, this.offset + 20)
      this.offset += 20
    },
    async fetchBricks(search = "", offset = "") {
      try {
        const url =
          `https://stage2.bell.babson.edu/jsonapi/bricks?page[limit]=20&filter[brickInscription][operator]=CONTAINS&filter[brickInscription][value]=` +
          search + '&page[offset]=' + offset;
        axios.defaults.withCredentials = true;
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
        const results = response.data.data;
        let data = results.map((bricks) => ({
          id: bricks.id,
          number: bricks.attributes.brickNumber,
          inscription: bricks.attributes.brickInscription,
          brickImage: bricks.relationships.brickImage.data.id,
          brickParkLocation: bricks.relationships.brickParkLocation.data.id,
        }));

        // If searching, remove existing items
        if (search.length !== 0) { this.bricks = [] }
        this.bricks.push(...data);
        //console.log(data);
        if (response.data.links.next && search.length == 0) {
          this.nextPage = true
        } else this.nextPage = false
        if (offset) this.offset = offset;
      } catch (err) {
        if (err.response) {
          // client received an error response (5xx, 4xx)
          console.log("Server Error:", err);
        } else if (err.request) {
          // client never received a response, or request never left
          console.log("Network Error:", err);
        } else {
          console.log("Client Error:", err);
        }
      }
    },
  },
  mounted() {
    this.fetchBricks();
  },
};
</script>
