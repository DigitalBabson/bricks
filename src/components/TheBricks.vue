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
        {
          id: 'bjohnson2019',
          firstName: 'Brandon',
          lastName: 'Johnson',
          year: '2019',
          inscription: 'BRANDON PE JOHNSON BBALL CAPTAIN 2019',
          imgLink: 'src/assets/bricks/IMG_2000.jpg',
          zone: 'zone1'
        },
        {
          id: 'croberston1983',
          firstName: 'Craig',
          lastName: 'Robertson',
          year: '1983',
          inscription: 'CRAIG ROBERTSON 1983',
          imgLink: 'src/assets/bricks/IMG_2003.jpg',
          zone: 'zone2'
        },
        {
          id: 'mpattyson2021',
          firstName: 'Matt',
          lastName: 'Pattyson',
          year: '2021',
          inscription: 'MATT PATTYSON CLASS OF 2021',
          imgLink: 'src/assets/bricks/IMG_2005.jpg',
          zone: 'zone3'
        },
        {
          id: 'jtgrove1977',
          firstName: 'Joanne',
          lastName: 'Grove',
          year: '1977',
          inscription: 'JOANNE THOMAS GROVE B\'1977',
          imgLink: 'src/assets/bricks/IMG_2008.jpg',
          zone: 'zone1'
        }
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
        const url = `http://bell.babson.edu/jsonapi/bricks?fields[file--file]=uri,url`
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
  console.log(response);
        const results = response.data.data
        this.bricks = results.map(bricks => ({
          id: bricks.attributes.milleniumID,
          number: bricks.attributes.brickNumber,
          inscription: bricks.attributes.brickInscription,
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