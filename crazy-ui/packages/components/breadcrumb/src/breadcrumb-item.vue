<template>
  <span :class="[ns.b(), { 'is-link': to }]" @click="handleClick">
    <slot />
  </span>
  <span v-if="!isLast" :class="ns.e('separator')">{{ separator }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNamespace, useRouterLink } from '@crazy-ui/hooks';
import { breadcrumbItemProps } from './types';

const props = defineProps(breadcrumbItemProps);
const ns = useNamespace('breadcrumb-item');

const { navigate } = useRouterLink({ to: computed(() => props.to) });

function handleClick() {
  if (props.to) navigate();
}
</script>
