<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'

import {ref} from "vue";
import DynamicContent from "@/components/DynamicContent.vue";
import Spoiler from "@/components/Spoiler.vue";

const content = ref(`
<Tabs tabs='["a", "b"]'>
    <TabPanel value="0">
        test
    </TabPanel>
    <TabPanel value="1">
        test0
    </TabPanel>
</Tabs>
`);
</script>

<template>
  <DynamicContent :content="content" class="content"/>
</template>

<style scoped>
.content {
  width: 100%;
  max-width: 1200px;
  font-size: 20px;
}
</style>

<style>
#app {
  display: flex;
  justify-content: center;
}
</style>
