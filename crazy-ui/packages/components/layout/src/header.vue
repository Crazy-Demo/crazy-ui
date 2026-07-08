<template>
  <header :class="ns.b()" :style="{ height }">
    <slot />
  </header>
</template>

<script setup lang="ts">
import { useNamespace } from '@crazy-ui/hooks';
import { headerProps } from './types';

const props = defineProps(headerProps);
const ns = useNamespace('layout-header');
</script>
