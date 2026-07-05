<template>
  <div
    :class="[
      ns.b(),
      ns.is('error', validateState === 'error'),
      ns.is('required', isRequired),
    ]"
    :aria-invalid="validateState === 'error' ? 'true' : undefined"
    :aria-describedby="errorId"
  >
    <!-- Label -->
    <label
      v-if="props.label || $slots.label"
      :class="ns.e('label')"
      :style="labelStyle"
    >
      <slot name="label">{{ props.label }}</slot>
    </label>

    <!-- Content -->
    <div :class="ns.e('content')">
      <slot />
      <!-- Error message -->
      <div
        v-if="validateState === 'error' && errorMessage"
        :class="ns.e('error')"
        :id="errorId"
        role="alert"
      >
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, provide, reactive, onMounted, onBeforeUnmount, type InjectionKey } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { formInjectionKey, formItemInjectionKey } from '@crazy-ui/core';
import type { ComponentSize } from '@crazy-ui/core';
import { formItemProps } from './types';
import type { FormContext } from './types';

const props = defineProps(formItemProps);
const ns = useNamespace('form-item');

const form = inject(formInjectionKey as unknown as InjectionKey<FormContext>, undefined);
const validateState = ref<'error' | 'success' | 'warning' | 'validating' | ''>('');
const errorMessage = ref('');
const inputIds = ref<string[]>([]);

// Check if this field is required
const isRequired = computed(() => {
  if (!props.prop || !form?.rules) return false;
  const rules = form.rules[props.prop];
  return rules?.some((r: any) => r.required) ?? false;
});

// Label width style
const labelStyle = computed(() => {
  if (form?.labelWidth) {
    return { width: form.labelWidth };
  }
  return {};
});

// Compute size: FormItem prop > Form prop
const _size = computed<ComponentSize | undefined>(() => props.size ?? form?.size ?? 'medium');

// Disabled: FormItem prop > Form disabled
const _disabled = computed(() => props.disabled || form?.disabled || false);

// ARIA helpers
function addInputId(id: string) {
  inputIds.value.push(id);
}

function removeInputId(id: string) {
  const idx = inputIds.value.indexOf(id);
  if (idx > -1) inputIds.value.splice(idx, 1);
}

const errorId = computed(() =>
  inputIds.value.length > 0 ? `${inputIds.value[0]}-error` : undefined,
);

// Validate function called by input components via formItem.validate(trigger)
function validate(trigger: 'change' | 'blur') {
  if (!props.prop || !form) return;
  const rules = form.rules[props.prop];
  if (!rules) return;

  // Check if any rule matches the trigger
  const shouldValidate = rules.some((r: any) => !r.trigger || r.trigger === trigger);
  if (!shouldValidate) return;

  form.validateField(props.prop).then((result: any) => {
    validateState.value = result.valid ? 'success' : 'error';
    errorMessage.value = result.message;
    if (result.valid) {
      // Clear success state after a delay (visual feedback only on error)
      setTimeout(() => {
        if (validateState.value === 'success') validateState.value = '';
      }, 1000);
    }
  });
}

// Register with Form
onMounted(() => {
  if (props.prop && form) {
    form.registerField(props.prop, {
      validateState,
      errorMessage,
      addInputId,
      removeInputId,
      validate,
    });
  }
});

onBeforeUnmount(() => {
  if (props.prop && form) {
    form.unregisterField(props.prop);
  }
});

// Provide FormItem context for child input components
const formItemContext = reactive({
  size: _size,
  disabled: _disabled,
  validateState,
  validate,
  addInputId,
  removeInputId,
  errorId,
});

provide(
  formItemInjectionKey as unknown as InjectionKey<typeof formItemContext>,
  formItemContext,
);
</script>
