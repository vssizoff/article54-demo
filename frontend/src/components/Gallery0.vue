<script lang="ts">
import {Galleria} from "primevue";
import type {PropType} from "vue";

export default {
  name: "Gallery",
  components: {Galleria},
  props: {
    images: {
      type: Array as PropType<Array<{src: string, thumb: string, alt: string}>>,
      required: true
    }
  },
  data() {
    return {
      activeIndex: 0,
      responsiveOptions: [
        {
          breakpoint: '1024px',
          numVisible: 5
        },
        {
          breakpoint: '768px',
          numVisible: 3
        },
        {
          breakpoint: '560px',
          numVisible: 1
        }
      ],
      displayCustom: false
    };
  },
  methods: {
    imageClick(index: number) {
      this.activeIndex = index;
      this.displayCustom = true;
    }
  }
};
</script>

<template>
  <div>
    <Galleria v-model:activeIndex="activeIndex" v-model:visible="displayCustom" :value="images" :responsiveOptions="responsiveOptions" :numVisible="7"
              containerStyle="max-width: 850px" :circular="true" :fullScreen="true" :showItemNavigators="true" :showThumbnails="false">
      <template #item="slotProps">
        <img :src="slotProps.item.src" :alt="slotProps.item.alt" style="width: 100%; display: block"/>
      </template>
      <template #thumbnail="slotProps">
        <img :src="slotProps.item.thumb" :alt="slotProps.item.alt" style="display: block"/>
      </template>
    </Galleria>
    <div v-if="images" class="thumbs">
      <img v-for="(image, index) of images" :key="index" class="thumb" :src="image.thumb" :alt="image.alt" style="cursor: pointer" @click="imageClick(index)"/>
    </div>
  </div>
</template>

<style scoped>
.thumbs {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.thumb {
  height: 160px;
  border-radius: 10px;
}
</style>