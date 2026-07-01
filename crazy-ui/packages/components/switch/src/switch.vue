<template>
  <div
    :class="[
      ns.b(),
      ns.m(_size),
      {
        'is-checked': isChecked,
        'is-disabled': isDisabled,
        'is-loading': loading,
      },
    ]"
    role="switch"
    :aria-checked="isChecked"
    :aria-disabled="isDisabled || undefined"
    @click="handleClick"
  >
    <input
      :checked="isChecked"
      type="checkbox"
      :disabled="isDisabled"
      :name="name"
      :true-value="activeValue"
      :false-value="inactiveValue"
      :class="ns.e('original')"
    />
    <span :class="ns.e('core')">
      <span v-if="loading" :class="ns.e('loading-icon')" />
    </span>
    <span v-if="inlinePrompt && activeText && isChecked" :class="ns.e('label')">
      {{ activeText }}
    </span>
    <span v-if="inlinePrompt && inactiveText && !isChecked" :class="ns.e('label')">
      {{ inactiveText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNamespace, useFormItem } from '@crazy-ui/hooks';
import { switchProps, switchEmits } from './types';

const props = defineProps(switchProps);
const emit = defineEmits(switchEmits);

const ns = useNamespace('switch');
const {
  size: formSize,
  disabled: formDisabled,
} = useFormItem({
  size: computed(() => props.size),
  disabled: computed(() => props.disabled),
});

// ---------- Computed: Size ----------
const _size = computed(() => {
  return props.size ?? formSize.value ?? 'medium';
});

// ---------- Computed: Checked state ----------
const isChecked = computed(() => {
  return props.modelValue === props.activeValue;
});

// ---------- Computed: Disabled ----------
const isDisabled = computed(() => {
  return props.disabled || formDisabled.value;
});

// ---------- Handlers ----------
async function handleClick() {
  if (isDisabled.value || props.loading) return;

  const newVal = isChecked.value ? props.inactiveValue : props.activeValue;

  if (props.beforeChange) {
    try {
      const canChange = await props.beforeChange(newVal);
      if (canChange === false) return;
    } catch {
      return;
    }
  }

  emit('update:modelValue', newVal);
  emit('change', newVal);
}
</script>
