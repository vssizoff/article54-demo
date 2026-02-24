<script lang="ts">
import {Tab, TabList, Tabs, TabPanels} from "primevue";
import type {PropType} from "vue";

export default {
  name: "TabsComponent",
  components: {Tabs, TabList, Tab, TabPanels},
  props: {
    tabs: {
      type: Object as PropType<string>,
      required: true,
    }
  }
}
</script>

<template>
  <Tabs value="0" style="--p-tabs-tablist-background: transparent">
<!--    <TabList>-->
      <template v-for="(tab, index) in JSON.parse(tabs)">
        <Tab :value="index.toString()">{{tab}}</Tab>
      </template>
<!--    </TabList>-->
    <TabPanels>
      <slot/>
    </TabPanels>
  </Tabs>
</template>