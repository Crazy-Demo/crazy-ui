<template>
  <label
    :class="[
      ns.b(),
      ns.m(_size),
      {
        'is-disabled': isDisabled,
        'is-checked': isChecked,
        'is-indeterminate': indeterminate,
        'is-border': border,
      },
    ]"
    :aria-disabled="isDisabled || undefined"
  >
    <span
      :class="[
        ns.e('input'),
        {
          'is-checked': isChecked,
          'is-indeterminate': indeterminate,
        },
      ]"
    >
      <input
        :checked="isChecked"
        type="checkbox"
        :disabled="isDisabled"
        :name="name"
        :aria-checked="indeterminate ? 'mixed' : isChecked"
        :aria-disabled="isDisabled || undefined"
        :class="ns.e('original')"
        @change="handleChange"
      />
      <span :class="ns.e('inner')">
        <span v-if="isChecked && !indeterminate" :class="ns.e('check-icon')">&#10003;</span>
        <span v-if="indeterminate" :class="ns.e('indeterminate-icon')">&#9472;</span>
      </span>
    </span>
    <span v-if="$slots.default || label" :class="ns.e('label')">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useNamespace, useFormItem } from '@crazy-ui/hooks';
import { checkboxProps, checkboxEmits, checkboxGroupInjectionKey } from './types';
import type { CheckboxGroupContext } from './types';

const props = defineProps(checkboxProps);
const emit = defineEmits(checkboxEmits);

const ns = useNamespace('checkbox');
const group = inject<CheckboxGroupContext | undefined>(
  checkboxGroupInjectionKey,
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

// ---------- Computed: the value used in group array membership ----------
const groupValue = computed<string | number | boolean>(() => {
  return props.label ?? props.trueValue;
});

// ---------- Computed: Checked state ----------
const isChecked = computed(() => {
  if (group) {
    return (group.modelValue.value ?? []).includes(groupValue.value as string | number);
  }
  return props.modelValue === props.trueValue;
});

// ---------- Computed: Disabled ----------
const isDisabled = computed(() => {
  if (group) {
    const maxReached =
      group.max.value !== undefined &&
      (group.modelValue.value?.length ?? 0) >= group.max.value &&
      !isChecked.value;
    return props.disabled || group.disabled.value || formDisabled.value || maxReached;
  }
  return props.disabled || formDisabled.value;
});

// ---------- Handlers ----------
function handleChange(event: Event) {
  if (isDisabled.value) return;

  const checked = (event.target as HTMLInputElement).checked;

  if (group) {
    const currentValues = [...(group.modelValue.value ?? [])];
    if (checked) {
      currentValues.push(groupValue.value as string | number);
    } else {
      const idx = currentValues.indexOf(groupValue.value as string | number);
      if (idx > -1) currentValues.splice(idx, 1);
    }
    group.changeEvent(currentValues);
  } else {
    const newVal = checked ? props.trueValue : props.falseValue;
    emit('update:modelValue', newVal);
    emit('change', newVal);
  }
}
</script>
