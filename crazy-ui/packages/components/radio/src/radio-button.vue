<template>
  <label
    :class="[
      ns.b(),
      ns.m(_size),
      {
        'is-disabled': isDisabled,
        'is-checked': isChecked,
      },
    ]"
    :aria-disabled="isDisabled || undefined"
  >
    <input
      :checked="isChecked"
      type="radio"
      :disabled="isDisabled"
      :name="name"
      :value="label"
      :aria-checked="isChecked"
      :aria-disabled="isDisabled || undefined"
      :class="ns.e('original')"
      @change="handleChange"
    />
    <span v-if="$slots.default || label != null" :class="ns.e('label')">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useNamespace, useFormItem } from '@crazy-ui/hooks';
import { radioButtonProps, radioGroupInjectionKey } from './types';
import type { RadioGroupContext } from './types';

const props = defineProps(radioButtonProps);
const ns = useNamespace('radio-button');

const group = inject<RadioGroupContext>(
  radioGroupInjectionKey,
  undefined,
);

if (!group) {
  throw new Error('RadioButton must be used within a RadioGroup');
}

const {
  size: formSize,
  disabled: formDisabled,
} = useFormItem({
  size: computed(() => props.size),
  disabled: computed(() => props.disabled),
});

// ---------- Computed: Size ----------
const _size = computed(() => {
  return props.size ?? group.size.value ?? formSize.value ?? 'medium';
});

// ---------- Computed: Checked state ----------
const isChecked = computed(() => {
  return group.modelValue.value === props.label;
});

// ---------- Computed: Disabled ----------
const isDisabled = computed(() => {
  return props.disabled || group.disabled.value || formDisabled.value;
});

// ---------- Handlers ----------
function handleChange() {
  if (isDisabled.value) return;
  group.changeEvent(props.label);
}
</script>
