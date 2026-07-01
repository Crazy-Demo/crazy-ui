<template>
  <div :class="[ns.b(), { 'is-disabled': isDisabled }]" role="group" :aria-disabled="isDisabled || undefined">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import {
  checkboxGroupProps,
  checkboxGroupEmits,
  checkboxGroupInjectionKey,
} from './types';

const props = defineProps(checkboxGroupProps);
const emit = defineEmits(checkboxGroupEmits);
const ns = useNamespace('checkbox-group');

const isDisabled = computed(() => props.disabled);

provide(checkboxGroupInjectionKey, {
  modelValue: computed(() => props.modelValue ?? []),
  disabled: computed(() => props.disabled),
  size: computed(() => props.size),
  min: computed(() => props.min),
  max: computed(() => props.max),
  changeEvent: (val: (string | number)[]) => {
    emit('update:modelValue', val);
    emit('change', val);
  },
});
</script>
