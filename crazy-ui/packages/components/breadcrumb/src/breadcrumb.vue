<template>
  <div :class="ns.b()" role="navigation" aria-label="Breadcrumb">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useNamespace } from '@crazy-ui/hooks';

const ns = useNamespace('breadcrumb');
</script>
