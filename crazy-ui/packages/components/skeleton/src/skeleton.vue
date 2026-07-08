<template>
  <template v-if="loading">
    <div :class="[ns.b(), { 'is-animated': animated }]">
      <div
        v-for="i in rows"
        :key="i"
        :class="ns.e('row')"
      >
        <slot name="template">
          <span :class="[ns.e('item'), ns.em('item', 'text')]" />
        </slot>
      </div>
    </div>
  </template>
  <template v-else>
    <slot />
  </template>
</template>

<script setup lang="ts">
import { useNamespace } from '@crazy-ui/hooks';
import { skeletonProps } from './types';

defineProps(skeletonProps);
const ns = useNamespace('skeleton');
</script>
