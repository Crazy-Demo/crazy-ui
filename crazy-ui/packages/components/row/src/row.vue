<template>
  <component
    :is="tag"
    :class="[
      ns.b(),
      ns.m(align),
      ns.m(`justify-${justify}`),
      { 'is-wrap': wrap, 'is-nowrap': !wrap },
    ]"
    :style="rowStyle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { rowProps, rowInjectionKey } from './types';
import type { RowContext } from './types';

const props = defineProps(rowProps);
const ns = useNamespace('row');

const gutterValue = computed(() => {
  if (typeof props.gutter === 'number') return props.gutter;
  return 0;
});

const rowStyle = computed(() => {
  const g = gutterValue.value;
  if (g <= 0) return {};
  const half = `-${g / 2}px`;
  return {
    marginLeft: half,
    marginRight: half,
  };
});

provide<RowContext>(rowInjectionKey, {
  gutter: gutterValue,
});
</script>
