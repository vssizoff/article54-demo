<script lang="ts" setup>
import {Button, Panel} from "primevue";
import arrowSvg from "./assets/arrowDown.svg";
import {ref} from "vue";

const props = defineProps({
  title: {
    type: String
  },
  color: {
    type: String
  }
});

const active = ref(true);
</script>

<template>
  <Panel :collapsed="active" :style="{...(props.color ? {'--p-panel-background': props.color} : {}), '--p-panel-content-padding': '0 10px 10px 10px'}">
    <template #header>
      <Button @click="active = !active"><img :src="arrowSvg" alt="open/close">{{props.title ?? ""}}</Button>
    </template>
    <slot/>
  </Panel>
</template>