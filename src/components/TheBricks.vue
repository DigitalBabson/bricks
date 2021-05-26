<template>
  <!--form class="container mx-auto max-w-6xl bg-yellow-100 py-2 mb-5">
  <div class="form-control">
    <label for="search-brick" class="mr-2">Search bricks by name</label>
    <input id="search-brick"  v-model="filter.inscription" type="text"/>
  </div>
</form-->
  <brick-filter v-model:inscription="filter.inscription" v-model:reset="resetForm" />
<div class="bricks container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-5">
  <brick-card v-for="brick in filterBricksByName" :key="brick.id" :brick="brick" />
</div>
  <h3 class="container mx-auto max-w-6xl msg_no_results text-3xl" v-if="filterBricksByName.length === 0">No bricks match your criteria</h3>


</template>

<script>
import axios from "axios";
import BrickCard from './BrickCard.vue';
import BrickFilter from './BrickFilter.vue';

export default {
	components: {
		BrickCard,
    BrickFilter
	},
  data() {
    return {
      filter: {
        inscription: '',
      },
      bricks: [
      ]
    }
  },
  computed: {
    filterBricksByName() {
      return this.bricks.filter(brick => brick.inscription.toString().match(new RegExp(this.filter.inscription.trim().toString(), 'i')))
    }
  },
  methods: {
    resetForm() {
      this.filter.inscription = '';
    },
    async fetchBricks() {
      try {
        const url = `http://bell.babson.edu/jsonapi/bricks`
        axios.defaults.withCredentials = true;
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
        const results = response.data.data
        this.bricks = results.map(bricks => ({
          id: bricks.id,
          number: bricks.attributes.brickNumber,
          inscription: bricks.attributes.brickInscription,
          brickImage: bricks.relationships.brickImage.data.id,
          brickParkLocation: bricks.relationships.brickParkLocation.data.id,
          imgLink: 'src/assets/bricks/IMG_2008.jpg',
          zone: 'zone1'
        }))
      } catch (err) {
        if (err.response) {
          // client received an error response (5xx, 4xx)
          console.log("Server Error:", err)
        } else if (err.request) {
          // client never received a response, or request never left
          console.log("Network Error:", err)
        } else {
          console.log("Client Error:", err)
        }
      }
    },
  },
  mounted() {
    this.fetchBricks();
  }
}
</script>
