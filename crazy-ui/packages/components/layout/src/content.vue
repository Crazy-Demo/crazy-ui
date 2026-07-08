<template>
  <main :class="ns.b()">
    <slot />
  </main>
</template>

<script setup lang="ts">
import { useNamespace } from '@crazy-ui/hooks';
const ns = useNamespace('layout-content');
</script>
