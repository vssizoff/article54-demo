<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'

import {ref} from "vue";
import DynamicContent from "@/components/DynamicContent.vue";

const content = ref("<h1 id=\"test\" tabindex=\"-1\">test</h1><pre class=\"language-typescript\"><code><span class=\"hljs-keyword\">async</span><span class=\"hljs-keyword\">function</span><span class=\"hljs-title function_\">x</span>(<span class=\"hljs-params\"></span>) {\n}\n</code></pre><hr /><Spoiler title=\"vghnbvfi\" color=\"green\"><pre><code>&lt;script setup lang=&quot;ts&quot;&gt;\nimport {RouterView} from 'vue-router'\n&lt;/script&gt;\n&lt;template&gt;\n  &lt;RouterView/&gt;\n&lt;/template&gt;\n&lt;style scoped&gt;\n&lt;/style&gt;\n</code></pre></Spoiler>");
</script>

<template>
<DynamicContent :content="content"/>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
