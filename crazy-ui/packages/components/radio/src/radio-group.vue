<template>
  <div
    :class="[
      ns.b(),
      {
        'is-disabled': isDisabled,
      },
    ]"
    role="radiogroup"
    :aria-disabled="isDisabled || undefined"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import {
  radioGroupProps,
  radioGroupEmits,
  radioGroupInjectionKey,
} from './types';

const props = defineProps(radioGroupProps);
const emit = defineEmits(radioGroupEmits);
const ns = useNamespace('radio-group');

const isDisabled = computed(() => props.disabled);

provide(radioGroupInjectionKey, {
  modelValue: computed(() => props.modelValue),
  disabled: computed(() => props.disabled),
  size: computed(() => props.size),
  changeEvent: (val: string | number | boolean) => {
    emit('update:modelValue', val);
    emit('change', val);
  },
});
</script>
