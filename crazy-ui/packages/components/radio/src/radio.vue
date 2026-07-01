<template>
  <label
    :class="[
      ns.b(),
      ns.m(_size),
      {
        'is-disabled': isDisabled,
        'is-checked': isChecked,
        'is-border': border,
      },
    ]"
    :aria-disabled="isDisabled || undefined"
  >
    <span
      :class="[
        ns.e('input'),
        { 'is-checked': isChecked },
      ]"
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
      <span :class="ns.e('inner')" />
    </span>
    <span v-if="$slots.default || label != null" :class="ns.e('label')">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useNamespace, useFormItem } from '@crazy-ui/hooks';
import { radioProps, radioEmits, radioGroupInjectionKey } from './types';
import type { RadioGroupContext } from './types';

const props = defineProps(radioProps);
const emit = defineEmits(radioEmits);

const ns = useNamespace('radio');
const group = inject<RadioGroupContext | undefined>(
  radioGroupInjectionKey,
  undefined,
);
const {
  size: formSize,
  disabled: formDisabled,
} = useFormItem({
  size: computed(() => props.size),
  disabled: computed(() => props.disabled),
});

// ---------- Computed: Size ----------
const _size = computed(() => {
  return props.size ?? group?.size.value ?? formSize.value ?? 'medium';
});

// ---------- Computed: Checked state ----------
const isChecked = computed(() => {
  const value = props.label;
  if (group) {
    return group.modelValue.value === value;
  }
  return props.modelValue === value;
});

// ---------- Computed: Disabled ----------
const isDisabled = computed(() => {
  return props.disabled || group?.disabled.value || formDisabled.value;
});

// ---------- Handlers ----------
function handleChange() {
  if (isDisabled.value) return;
  const value = props.label;
  if (group) {
    group.changeEvent(value);
  } else {
    emit('update:modelValue', value);
    emit('change', value);
  }
}
</script>
