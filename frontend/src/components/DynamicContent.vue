<!-- components/DynamicContent.vue -->
<script setup lang="ts">
import { h, ref, onMounted, watch, defineAsyncComponent, render, onUnmounted, resolveComponent, openBlock, createElementVNode, createElementBlock, createTextVNode, createVNode, withCtx } from 'vue'
import { compile } from '@vue/compiler-dom'
import type { Component } from 'vue'

const props = defineProps<{
  content: string
}>()

const container = ref<HTMLElement | null>(null)

// Регистрация ваших компонентов
const components: Record<string, Component> = {
  Test: defineAsyncComponent(() => import('@/components/Test.vue')),
  Spoiler: defineAsyncComponent(() => import('@/components/Spoiler.vue')),
  Tabs: defineAsyncComponent(() => import('@/components/Tabs.vue')),
  TabPanel: defineAsyncComponent(async () => (await import("primevue")).TabPanel),
}

const renderContent = () => {
  if (!container.value) return

  try {
    container.value.innerHTML = ''

    // Добавляем обертку для нескольких корневых элементов
    const wrappedContent = `<div>${props.content}</div>`

    // Компилируем шаблон
    const { code } = compile(wrappedContent, {
      hoistStatic: true,
      // cacheHandlers: true,
      sourceMap: process.env.NODE_ENV === 'development'
    })

    // Создаем функцию рендеринга без конфликта имен параметров

    const renderFn = new Function('vue', 'registeredComponents', `
      const { h: createElement, resolveComponent } = vue
      console.log(vue);
      const Vue = vue;

      return function render() {
        const compiledRender = (() => {${code}})()
        return compiledRender.call(this, createElement, registeredComponents)
      }
    `)({ h, resolveComponent, openBlock, createElementVNode, createElementBlock, createTextVNode, createVNode, withCtx }, components)

    // Создаем vnode
    const vnode = h({
      render: renderFn,
      components
    })

    // Рендерим в контейнер
    render(vnode, container.value)
  } catch (e) {
    console.error('Ошибка рендеринга контента:', e)
    container.value!.innerHTML = `<div class="error">Ошибка при отображении контента: ${e.message}</div>`
  }
}

// Первичный рендеринг
onMounted(renderContent)

// Перерисовка при изменении контента
watch(() => props.content, renderContent)

// Очистка при размонтировании
onUnmounted(() => {
  if (container.value) {
    render(null, container.value)
  }
})
</script>

<template>
  <div ref="container" class="dynamic-content"></div>
</template>

<style scoped>
.dynamic-content :deep(code) {
  //padding: 0.2em 0.4em;
  //background-color: var(--vp-code-bg, #f5f5f5);
  //border-radius: 20px;
  font-family: monospace;
  font-size: 0.9em;
}

.dynamic-content :deep(.typst-frame) {
  filter: invert(100%) sepia(0%) saturate(367%) hue-rotate(19deg) brightness(105%) contrast(101%);
}

.dynamic-content :deep(pre) {
  //margin: 1em 0;
  padding: 1em;
  //background-color: var(--vp-code-bg, #f5f5f5);
  border-radius: 20px;
  overflow-x: auto;
  line-height: 1.5;
}

.dynamic-content :deep(.error) {
  //color: var(--vp-c-red, #ff5555);
  padding: 1em;
  //border: 1px solid var(--vp-c-red, #ff5555);
  border-radius: 4px;
  background-color: #fff5f5;
  margin: 1em 0;
}

.dynamic-content :deep(h1),
.dynamic-content :deep(h2),
.dynamic-content :deep(h3),
.dynamic-content :deep(h4),
.dynamic-content :deep(h5),
.dynamic-content :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.3;
}

.dynamic-content {
  width: 100%;
}
</style>