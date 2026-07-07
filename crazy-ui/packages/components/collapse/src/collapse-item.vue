<template>
  <div :class="[ns.b(), { 'is-active': isActive, 'is-disabled': disabled }]">
    <div
      :class="ns.e('header')"
      @click="handleClick"
      role="button"
      :aria-expanded="isActive"
      :tabindex="disabled ? -1 : 0"
    >
      <slot name="title">{{ title }}</slot>
      <span :class="[ns.e('arrow'), { 'is-active': isActive }]">›</span>
    </div>
    <div v-show="isActive" :class="ns.e('content')"><slot /></div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { collapseItemProps } from './types';

const props = defineProps(collapseItemProps);
const ns = useNamespace('collapse-item');

interface CollapseContext {
  activeNames: { value: (string | number)[] };
  accordion: { value: boolean };
  toggle: (name: string | number) => void;
}

const ctx = inject<CollapseContext>('collapseContext')!;

const isActive = computed(() => {
  const names = ctx?.activeNames?.value || [];
  return names.includes(props.name);
});

function handleClick() {
  if (!props.disabled && ctx) {
    ctx.toggle(props.name);
  }
}
</script>
