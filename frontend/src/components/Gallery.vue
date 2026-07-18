<script lang="ts" setup>
import Gallery0 from "./Gallery0.vue";
import {inject, onMounted, type PropType, ref, watch} from "vue";

const props = defineProps({
  images: {
    type: Object as PropType<string>,
    required: true
  }
});

const attachmentsResolver = inject<(file: string) => Promise<string> | string>("attachmentsResolver", file => file);
const thumbnailsResolver = inject<(file: string) => Promise<string> | string>("thumbnailsResolver", file => file);

const images = ref<Array<{src: string, thumb: string, alt: string | undefined}>>([]);

async function getImages() {
  const rawImages = JSON.parse(props.images) as {[key: string]: string} | Array<string>;
  images.value = await Promise.all((Array.isArray(rawImages) ? rawImages.map(file => ([file, ""])) : Object.entries(rawImages)).map(async ([file, alt]) =>
      ({src: await attachmentsResolver(file), thumb: await thumbnailsResolver(file), alt})
  ));
  console.log(images.value)
}

onMounted(() => getImages());
watch(props, () => getImages(), {deep: true});
</script>

<template>
  <Gallery0 :images="images" :attachmentsResolver="attachmentsResolver"/>
</template>