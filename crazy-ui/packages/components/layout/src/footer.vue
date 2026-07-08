<template>
  <footer :class="ns.b()" :style="{ height }">
    <slot />
  </footer>
</template>

<script setup lang="ts">
import { useNamespace } from '@crazy-ui/hooks';
import { footerProps } from './types';

const props = defineProps(footerProps);
const ns = useNamespace('layout-footer');
</script>
