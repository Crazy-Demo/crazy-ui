<template>
  <span :class="[ns.b(), ns.m(variant)]">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { useNamespace } from '@crazy-ui/hooks';
import { skeletonItemProps } from './types';

defineProps(skeletonItemProps);
const ns = useNamespace('skeleton-item');
</script>
