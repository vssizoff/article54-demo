<script lang="ts">
import {Panel} from "primevue";
import {defineComponent} from "vue";

export default defineComponent({
  name: "ColoredComponent",
  components: {Panel},
  props: {
    color: {
      type: String,
      default: "green"
    }
  }
})
</script>

<template>
<!--  <glm-content-area class="content-area" :bg="(attributes ?? {}).color" :clear="nested">-->
<!--&lt;!&ndash;    <article-renderer0 :data="elements"/>&ndash;&gt;-->
<!--    <slot/>-->
<!--  </glm-content-area>-->
  <Panel :style="{'--p-panel-background': color, '--p-panel-header-padding': '0', '--p-panel-content-padding': '10px'}" class="colored">
    <slot/>
  </Panel>
</template>