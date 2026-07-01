<template>
  <li :class="ns.b()">
    <div v-if="title" :class="ns.e('title')">{{ title }}</div>
    <slot v-else name="title" />
    <ul :class="ns.e('group')">
      <slot />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { useNamespace } from '@crazy-ui/hooks';
import { menuItemGroupProps } from './types';

const props = defineProps(menuItemGroupProps);
const ns = useNamespace('menu-item-group');
</script>
