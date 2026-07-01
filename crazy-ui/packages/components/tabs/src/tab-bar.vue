<template>
  <div :class="[ns.b(), { 'is-vertical': isVertical }]" :style="barStyle" />
</template>

<script setup lang="ts">
import { computed, inject, watch, nextTick, ref, onMounted, onBeforeUnmount } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { tabsInjectionKey } from './context';

const ns = useNamespace('tab-bar');
const tabs = inject(tabsInjectionKey)!;

const isVertical = computed(() => tabs.position.value === 'left' || tabs.position.value === 'right');
const barStyle = ref<Record<string, string>>({});

function update() {
  const activeName = tabs.active.value;
  const navEl = document.querySelector(`[data-tabs-nav]`);
  if (!navEl) return;
  const activeTab = navEl.querySelector(`[data-tab-name="${activeName}"]`) as HTMLElement;
  if (!activeTab) return;

  if (isVertical.value) {
    barStyle.value = {
      height: `${activeTab.offsetHeight}px`,
      transform: `translateY(${activeTab.offsetTop}px)`,
    };
  } else {
    barStyle.value = {
      width: `${activeTab.offsetWidth}px`,
      transform: `translateX(${activeTab.offsetLeft}px)`,
    };
  }
}

watch(() => tabs.active.value, () => nextTick(update));
watch(() => tabs.panes.value, () => nextTick(update), { deep: true });

let observer: ResizeObserver | null = null;
onMounted(() => {
  const navEl = document.querySelector(`[data-tabs-nav]`);
  if (navEl) {
    try {
      observer = new ResizeObserver(() => update());
      observer.observe(navEl);
    } catch {
      // ResizeObserver not available
    }
  }
  nextTick(update);
});
onBeforeUnmount(() => observer?.disconnect());
</script>
