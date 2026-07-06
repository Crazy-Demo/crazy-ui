<template>
  <div :class="ns.b()">
    <slot />
    <sup
      v-if="!hidden"
      :class="[
        ns.e('content'),
        ns.em('content', type),
        { 'is-dot': isDot, 'is-fixed': !$slots.default },
      ]"
    >
      {{ displayValue }}
    </sup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { badgeProps } from './types';

const props = defineProps(badgeProps);
const ns = useNamespace('badge');

const displayValue = computed(() => {
  if (props.isDot) return '';
  const num = Number(props.value);
  if (isNaN(num)) return props.value;
  if (num > props.max) return `${props.max}+`;
  return String(num);
});
</script>
