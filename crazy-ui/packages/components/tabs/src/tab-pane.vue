<template>
  <div
    v-if="shouldRender"
    v-show="isActive"
    :class="[ns.b(), { 'is-active': isActive }]"
    role="tabpanel"
    :aria-labelledby="`tab-${name}`"
    :id="`panel-${name}`"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, onBeforeUnmount } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { tabPaneProps } from './types';
import { tabsInjectionKey } from './context';

const props = defineProps(tabPaneProps);
const ns = useNamespace('tab-pane');
const tabs = inject(tabsInjectionKey)!;

const name = props.name;

const isActive = computed(() => tabs.active.value === name);
const hasBeenActive = ref(false);

watch(isActive, (val) => { if (val) hasBeenActive.value = true; }, { immediate: true });

const isLazy = computed(() => props.lazy ?? tabs.lazy.value);
const shouldRender = computed(() => {
  if (!isLazy.value) return true;
  if (isActive.value) return true;
  if (hasBeenActive.value && props.cache) return true;
  return false;
});

// Register in setup so TabNav picks up panes on first reactive update
tabs.registerPane({
  name,
  title: props.title ?? String(name),
  disabled: props.disabled,
  closable: props.closable,
  lazy: props.lazy,
  cache: props.cache,
});

onBeforeUnmount(() => {
  tabs.unregisterPane(name);
});
</script>
