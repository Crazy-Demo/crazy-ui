<template>
  <div
    :class="[ns.b(), ns.m(direction), { 'is-dashed': dashed }]"
    role="separator"
  >
    <span v-if="$slots.default" :class="ns.e('text')">
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
import { useNamespace } from '@crazy-ui/hooks';
import { dividerProps } from './types';

defineProps(dividerProps);
const ns = useNamespace('divider');
</script>
