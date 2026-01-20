<template>
<article class="brick-card border border-gray-100 shadow-sm text-center">
  <!-- Image container with placeholder fallback -->
  <div class="brick-image-container" @click="openImg">
    <img
      v-if="!imageError"
      :src="brick.imgLink"
      @error="handleImageError"
      class="brick-image"
      alt="Brick inscription"
    />
    <div v-else class="brick-placeholder">
      <div class="inscription-overlay">
        {{ brick.inscription }}
      </div>
    </div>
  </div>

  <teleport to="body">
    <transition name="fade">
  <ui-modal v-if="showImg" @close="closeImg">
    <div class="modal-image-container">
      <img
        v-if="!imageError"
        class="object-contain max-h-full"
        :src="brick.imgLink"
        @error="handleImageError"
        alt="Brick inscription (large view)"
      />
      <div v-else class="brick-placeholder-large">
        <div class="inscription-overlay-large">
          {{ brick.inscription }}
        </div>
      </div>
    </div>
</ui-modal>
    </transition>
  </teleport>
  <button class="bg-gray-100 p-3 my-3" @click="openMap">View on map</button>

</article>
<!--brick-map v-if="showMap" :zone="brick.zone" @close="closeMap" />-->
<teleport to="body">
  <transition name="fade">
<ui-modal v-if="showMap" @close="closeMap">
    <img class="object-contain max-h-full" :src="'src/assets/maps/'+brick.zone+'.jpg'" />
</ui-modal>
  </transition>
</teleport>
</template>

<script>
//import BrickMap from './BrickMap.vue';
import UiModal from './UiModal.vue';
export default {
  props: ['brick'],
  data() {
    return {
      showMap: false,
      showImg: false,
      imageError: false,
    }
  },
	components: {
		//BrickMap,
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
    handleImageError() {
      this.imageError = true;
    }
  }
}
</script>

<style scoped>
button {
  color:#064;
}

/* Image container */
.brick-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  cursor: pointer;
  overflow: hidden;
  background-color: #f3f4f6;
}

.brick-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Placeholder styles */
.brick-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C7D28A 0%, #9BA86B 50%, #6B7A45 100%);
  position: relative;
}

.brick-placeholder-large {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C7D28A 0%, #9BA86B 50%, #6B7A45 100%);
  position: relative;
}

/* Inscription overlay styles */
.inscription-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #064;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  padding: 1.5rem;
  max-width: 90%;
  word-wrap: break-word;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8),
               0 1px 2px rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.inscription-overlay-large {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #064;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  padding: 2.5rem;
  max-width: 80%;
  word-wrap: break-word;
  text-shadow: 0 2px 6px rgba(255, 255, 255, 0.9),
               0 1px 3px rgba(255, 255, 255, 1);
  line-height: 1.5;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  backdrop-filter: blur(6px);
}

/* Modal image container */
.modal-image-container {
  position: relative;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
