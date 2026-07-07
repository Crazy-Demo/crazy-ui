<template>
  <div :class="[ns.b(), shadow === 'always' ? 'is-shadow' : shadow === 'hover' ? 'is-hover-shadow' : '']">
    <div v-if="$slots.header || title" :class="ns.e('header')">
      <slot name="header">{{ title }}</slot>
    </div>
    <div :class="ns.e('body')"><slot /></div>
    <div v-if="$slots.footer" :class="ns.e('footer')"><slot name="footer" /></div>
  </div>
</template>

<script setup lang="ts">
import { useNamespace } from '@crazy-ui/hooks';
import { cardProps } from './types';

defineProps(cardProps);

const ns = useNamespace('card');
</script>
