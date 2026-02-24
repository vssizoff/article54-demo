<script lang="ts" setup>
import {Image} from "primevue";
import {onMounted, ref, watch, inject} from "vue";
import style from "./main.module.css";

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String
  }
});

const src = ref("");

const attachmentsResolver = inject<(file: string) => Promise<string> | string>("attachmentsResolver", file => file);

async function getImage() {
  src.value = await attachmentsResolver(props.src);
}

onMounted(() => getImage());
watch(props, () => getImage(), {deep: true});
</script>

<template>
  <div :class="style.imgContainer">
    <Image v-if="src" :src="src" :alt="props.alt" :class="style.img"/>
<!--    <img v-if="src" :src="src" :alt="props.alt" :class="style.img"/>-->
  </div>
</template>