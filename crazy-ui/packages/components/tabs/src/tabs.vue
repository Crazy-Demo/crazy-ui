<template>
  <div :class="[ns.b(), ns.m(type), ns.is(position, true)]">
    <!-- Content renders first so TabPane children register before TabNav reads panes -->
    <div :class="ns.e('content')">
      <slot />
    </div>
    <!-- Tab nav always after content (simplified: always bottom) -->
    <div :class="ns.e('header')">
      <TabNav @add="emit('add')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, toRef } from 'vue';
import { useNamespace, useControllable } from '@crazy-ui/hooks';
import { tabsProps, tabsEmits, type TabPaneState } from './types';
import { tabsInjectionKey } from './context';
import TabNav from './tab-nav.vue';

const props = defineProps(tabsProps);
const emit = defineEmits(tabsEmits);
const ns = useNamespace('tabs');

const active = useControllable<string | number>({
  value: toRef(props, 'active'),
  defaultValue: toRef(props, 'defaultActive'),
  onChange: (v) => emit('update:active', v),
  fallback: '',
});

const panes = ref<TabPaneState[]>([]);

function registerPane(pane: TabPaneState) {
  panes.value.push(pane);
}

function unregisterPane(name: string | number) {
  const idx = panes.value.findIndex((p) => p.name === name);
  if (idx > -1) panes.value.splice(idx, 1);
}

const closable = computed(() => props.closable || props.editable);
const addable = computed(() => props.addable || props.editable);

async function selectTab(name: string | number) {
  const pane = panes.value.find((p) => p.name === name);
  if (!pane || pane.disabled || name === active.value) return;

  if (props.beforeLeave) {
    const canLeave = await props.beforeLeave(name, active.value);
    if (canLeave === false) return;
  }

  active.value = name;
  emit('change', name);
  emit('tab-click', name, {} as MouseEvent);
}

function closeTab(name: string | number) {
  const idx = panes.value.findIndex((p) => p.name === name);
  if (idx === -1) return;

  if (name === active.value) {
    const next = panes.value[idx + 1] ?? panes.value[idx - 1];
    if (next) active.value = next.name;
  }
  emit('close', name);
}

provide(tabsInjectionKey, {
  active,
  type: toRef(props, 'type'),
  position: toRef(props, 'position'),
  closable,
  lazy: toRef(props, 'lazy'),
  stretch: toRef(props, 'stretch'),
  addable,
  panes,
  registerPane,
  unregisterPane,
  selectTab,
  closeTab,
});
</script>
