<template>
  <div
    :class="[
      'crazy-input',
      `crazy-input--${_size}`,
      statusClass,
      {
        'is-disabled': _disabled,
        'is-focus': focused,
        'is-exceed': isExceed,
      },
    ]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <!-- prefix -->
    <span v-if="prefixIcon || $slots.prefix" class="crazy-input__prefix">
      <slot name="prefix">{{ prefixIcon }}</slot>
    </span>

    <!-- input -->
    <input
      v-if="type !== 'textarea'"
      ref="inputRef"
      :class="ns.e('inner')"
      :type="actualType"
      :value="modelValue"
      :disabled="_disabled"
      :readonly="readonly"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :minlength="minlength"
      :name="name"
      :id="inputId.id.value"
      :aria-invalid="validateState === 'error' ? 'true' : undefined"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleCompositionStart"
      @compositionend="onCompositionEnd"
    />

    <!-- textarea -->
    <textarea
      v-else
      ref="textareaRef"
      :class="[ns.e('inner'), ns.em('inner', 'textarea')]"
      :value="modelValue"
      :disabled="_disabled"
      :readonly="readonly"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :rows="rows"
      :name="name"
      :id="inputId.id.value"
      :aria-invalid="validateState === 'error' ? 'true' : undefined"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleCompositionStart"
      @compositionend="onCompositionEnd"
    />

    <!-- suffix -->
    <span v-if="hasSuffix" class="crazy-input__suffix">
      <span v-if="validateState === 'error'" class="crazy-input__suffix-icon" title="validation error">!</span>
      <span
        v-if="showClear"
        class="crazy-input__clear"
        role="button"
        aria-label="Clear input"
        tabindex="0"
        @click="onClear"
        @keydown.enter="onClear"
        @keydown.space.prevent="onClear"
      >✕</span>
      <span
        v-if="showPasswordToggle"
        class="crazy-input__password"
        role="button"
        :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
        tabindex="0"
        @click="togglePassword"
        @keydown.enter="togglePassword"
        @keydown.space.prevent="togglePassword"
      >👁</span>
      <slot name="suffix">{{ suffixIcon }}</slot>
    </span>

    <!-- word count -->
    <span v-if="showWordLimit && maxlength != null" class="crazy-input__count">
      {{ currentLength }} / {{ maxlength }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, useSlots } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { useInputCommon } from '../../_shared/use-input-common';
import { useClearable } from '../../_shared/use-clearable';
import { useComposition } from '../../_shared/use-composition';
import { useWordLimit } from '../../_shared/use-word-limit';
import { useAutosize } from './use-autosize';
import { inputProps, inputEmits } from './types';
import type { InputType } from './types';

const props = defineProps(inputProps);
const emit = defineEmits(inputEmits);

const ns = useNamespace('input');

const {
  _size,
  _disabled,
  validateState,
  formItem,
  inputId,
  statusClass,
} = useInputCommon({
  size: props.size,
  disabled: props.disabled,
  status: props.status,
});

const inputRef = ref<HTMLInputElement>();
const textareaRef = ref<HTMLTextAreaElement>();

const focused = ref(false);
const hovering = ref(false);

const { showClear } = useClearable({
  modelValue: toRef(props, 'modelValue'),
  clearable: toRef(props, 'clearable'),
  readonly: toRef(props, 'readonly'),
  disabled: _disabled,
  focused,
  hovering,
});

const { isComposing, handleCompositionStart, handleCompositionEnd } = useComposition();

const { currentLength, isExceed } = useWordLimit({
  modelValue: toRef(props, 'modelValue'),
  maxlength: toRef(props, 'maxlength'),
});

const autosizeModel = toRef(props, 'modelValue');
const autosizeProp = toRef(props, 'autosize');
if (props.type === 'textarea') {
  useAutosize(textareaRef as any, autosizeModel, autosizeProp);
}

const passwordVisible = ref(false);
const showPasswordToggle = computed(() => props.type === 'password' && props.showPassword);
const actualType = computed<InputType>(() => {
  if (props.type === 'password' && props.showPassword && passwordVisible.value) {
    return 'text';
  }
  return props.type;
});

const slots = useSlots();
const hasSuffix = computed(() =>
  showClear.value ||
  showPasswordToggle.value ||
  validateState.value === 'error' ||
  !!props.suffixIcon ||
  !!slots.suffix
);

function togglePassword() {
  passwordVisible.value = !passwordVisible.value;
}

function handleInput(event: Event) {
  if (isComposing.value) return;
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit('update:modelValue', target.value);
  emit('input', target.value);
}

function onCompositionEnd(event: CompositionEvent) {
  handleCompositionEnd(event);
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit('change', target.value);
  formItem?.validate('change');
}

function handleFocus(event: FocusEvent) {
  focused.value = true;
  emit('focus', event);
}

function handleBlur(event: FocusEvent) {
  focused.value = false;
  emit('blur', event);
  formItem?.validate('blur');
}

function onClear() {
  emit('update:modelValue', '');
  emit('change', '');
  emit('clear');
  formItem?.validate('change');
}
</script>
