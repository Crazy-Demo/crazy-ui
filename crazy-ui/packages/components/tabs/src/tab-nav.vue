<template>
  <div
    :class="[ns.b(), { 'is-vertical': isVertical, 'is-stretch': tabs.stretch.value }]"
    data-tabs-nav
    role="tablist"
    :aria-orientation="isVertical ? 'vertical' : 'horizontal'"
  >
    <div
      v-for="pane in tabs.panes.value"
      :key="pane.name"
      :class="[
        ns.e('item'),
        ns.em('item', tabs.type.value),
        {
          'is-active': tabs.active.value === pane.name,
          'is-disabled': pane.disabled,
        },
      ]"
      :data-tab-name="pane.name"
      role="tab"
      :aria-selected="tabs.active.value === pane.name"
      :aria-disabled="pane.disabled || undefined"
      :aria-controls="`panel-${pane.name}`"
      :tabindex="tabs.active.value === pane.name ? 0 : -1"
      @click="tabs.selectTab(pane.name)"
    >
      <span :class="ns.e('label')">
        <slot :name="`label-${pane.name}`" :pane="pane">{{ pane.title }}</slot>
      </span>
      <span
        v-if="isClosable(pane)"
        :class="ns.e('close')"
        @click.stop="tabs.closeTab(pane.name)"
      >✕</span>
    </div>
    <TabBar v-if="tabs.type.value === 'line'" />
    <span
      v-if="tabs.addable.value"
      :class="ns.e('add')"
      @click="emitAdd"
    >+</span>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { tabsInjectionKey } from './context';
import type { TabPaneState } from './types';
import TabBar from './tab-bar.vue';

const ns = useNamespace('tab-nav');
const tabs = inject(tabsInjectionKey)!;
const emit = defineEmits<{ add: [] }>();

const isVertical = computed(() => tabs.position.value === 'left' || tabs.position.value === 'right');

function isClosable(pane: TabPaneState) {
  if (pane.closable !== undefined) return pane.closable;
  return tabs.closable.value;
}

function emitAdd() {
  emit('add');
}
</script>
