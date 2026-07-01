<template>
  <button
    :type="nativeType"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="crazy-button__loading">
      <slot name="loading">
        <component :is="loadingIcon" v-if="loadingIcon" class="crazy-button__loading-icon" />
        <span v-else class="crazy-button__loading-icon" />
      </slot>
    </span>
    <span v-if="icon || $slots.icon" class="crazy-button__icon">
      <slot name="icon">
        <component :is="icon" />
      </slot>
    </span>
    <span class="crazy-button__content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { buttonProps } from './props';

const props = defineProps(buttonProps);
const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  return [
    'crazy-button',
    `crazy-button--${props.size}`,
    `crazy-button--${props.variant}`,
    `crazy-button--${props.color}`,
    {
      'is-disabled': props.disabled,
      'is-loading': props.loading,
      'crazy-button--circle': props.circle,
    },
  ];
});

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  emit('click', event);
};
</script>
