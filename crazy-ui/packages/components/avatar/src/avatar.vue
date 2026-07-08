<template>
  <span
    :class="[ns.b(), ns.m(shape), isCustomSize ? '' : ns.m(_size)]"
    :style="sizeStyle"
  >
    <img
      v-if="src && !hasError"
      :src="src"
      :alt="alt"
      :class="ns.e('image')"
      :style="{ objectFit: fit }"
      @error="handleError"
    />
    <span v-else-if="icon" :class="ns.e('icon')">
      <slot name="icon">{{ icon }}</slot>
    </span>
    <span v-else :class="ns.e('text')">
      <slot>{{ alt?.[0]?.toUpperCase() }}</slot>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { avatarProps } from './types';

const props = defineProps(avatarProps);
const ns = useNamespace('avatar');
const hasError = ref(false);

const sizeMap: Record<string, string> = {
  small: '32px',
  medium: '40px',
  large: '48px',
};

const isCustomSize = computed(() => typeof props.size === 'number');

const _size = computed(() =>
  typeof props.size === 'string' ? props.size : 'medium',
);

const pxSize = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`;
  return sizeMap[props.size] ?? sizeMap.medium;
});

const sizeStyle = computed(() => ({
  width: pxSize.value,
  height: pxSize.value,
  lineHeight: pxSize.value,
}));

function handleError() {
  hasError.value = true;
}
</script>
