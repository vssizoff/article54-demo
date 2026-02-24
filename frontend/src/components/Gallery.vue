<script lang="ts" setup>
import Gallery0 from "./Gallery0.vue";
import {inject, onMounted, type PropType, ref, watch} from "vue";

const props = defineProps({
  images: {
    type: Object as PropType<{[key: string]: string} | Array<string>>,
    required: true
  }
});

const attachmentsResolver = inject<(file: string) => Promise<string> | string>("attachmentsResolver", file => file);
const thumbnailsResolver = inject<(file: string) => Promise<string> | string>("thumbnailsResolver", file => file);

const images = ref<Array<{src: string, thumb: string, alt: string}>>([]);

async function getImages() {
  images.value = await Promise.all((Array.isArray(props.images) ? props.images.map(file => ([file, ""])) : Object.entries(props.images)).map(async ([file, alt]) =>
      ({src: await attachmentsResolver(file), thumb: await thumbnailsResolver(file), alt})
  ));
}

onMounted(() => getImages());
watch(props, () => getImages(), {deep: true});
</script>

<template>
  <Gallery0 :images="images" :attachmentsResolver="attachmentsResolver"/>
</template>