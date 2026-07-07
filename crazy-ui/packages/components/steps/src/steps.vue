<template>
  <div :class="[ns.b(), ns.m(direction)]">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, toRef } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { stepsProps, type StepsContext } from './types';

const props = defineProps(stepsProps);
const ns = useNamespace('steps');

provide<StepsContext>('stepsContext', {
  active: toRef(props, 'active'),
  finishStatus: toRef(props, 'finishStatus'),
});
</script>
