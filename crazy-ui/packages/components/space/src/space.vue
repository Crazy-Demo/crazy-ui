<template>
  <div
    :class="[ns.b(), ns.m(direction), ns.m(align), { 'is-wrap': wrap }]"
    :style="{ gap: gapSize }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { spaceProps } from './types';

const props = defineProps(spaceProps);
const ns = useNamespace('space');

const sizeMap: Record<string, string> = { small: '8px', medium: '16px', large: '24px' };
const gapSize = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : sizeMap[props.size] ?? '16px',
);
</script>
