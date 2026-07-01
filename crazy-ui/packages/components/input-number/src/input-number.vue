<template>
  <div
    :class="[
      'crazy-input-number',
      `crazy-input-number--${_size}`,
      {
        'is-disabled': _disabled,
        'is-focus': focused,
        'crazy-input-number--controls-right': controls && controlsPosition === 'right',
      },
    ]"
  >
    <!-- Decrease button (around: left side) -->
    <span
      v-if="controls && controlsPosition === 'around'"
      class="crazy-input-number__decrease"
      @mousedown.prevent="onDecreaseStart"
      @mouseup="onButtonUp"
      @mouseleave="onButtonUp"
    >−</span>

    <!-- Native input -->
    <input
      ref="inputRef"
      class="crazy-input-number__input"
      :value="displayValue"
      :disabled="_disabled"
      :placeholder="placeholder"
      :name="name"
      type="text"
      inputmode="decimal"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleCompositionStart"
      @compositionend="onCompositionEnd"
      @keydown.up.prevent="increase"
      @keydown.down.prevent="decrease"
    />

    <!-- Increase + Decrease buttons (right: stacked vertically) -->
    <span
      v-if="controls && controlsPosition === 'right'"
      class="crazy-input-number__controls-wrap"
    >
      <span
        class="crazy-input-number__increase"
        @mousedown.prevent="onIncreaseStart"
        @mouseup="onButtonUp"
        @mouseleave="onButtonUp"
      >+</span>
      <span
        class="crazy-input-number__decrease"
        @mousedown.prevent="onDecreaseStart"
        @mouseup="onButtonUp"
        @mouseleave="onButtonUp"
      >−</span>
    </span>

    <!-- Increase button (around: right side) -->
    <span
      v-else-if="controls"
      class="crazy-input-number__increase"
      @mousedown.prevent="onIncreaseStart"
      @mouseup="onButtonUp"
      @mouseleave="onButtonUp"
    >+</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useInputCommon } from '../../_shared/use-input-common';
import { useComposition } from '../../_shared/use-composition';
import { inputNumberProps, inputNumberEmits } from './types';

const props = defineProps(inputNumberProps);
const emit = defineEmits(inputNumberEmits);

const {
  _size,
  _disabled,
  formItem,
} = useInputCommon({
  size: props.size,
  disabled: props.disabled,
  status: props.status,
});

const { isComposing, handleCompositionStart, handleCompositionEnd } = useComposition();

// ---- Precision ----

const _precision = computed(() => {
  if (props.precision !== undefined) return props.precision;
  const stepStr = String(props.step);
  const dotIdx = stepStr.indexOf('.');
  return dotIdx > -1 ? stepStr.length - dotIdx - 1 : 0;
});

function toPrecision(val: number): number {
  if (!isFinite(val)) return val;
  if (_precision.value === 0) return Math.round(val);
  return Number(val.toFixed(_precision.value));
}

function clamp(val: number): number {
  let clamped = Math.min(props.max, Math.max(props.min, val));
  if (props.stepStrictly && props.step !== 0) {
    clamped = Math.round(clamped / props.step) * props.step;
  }
  return toPrecision(clamped);
}

// ---- State ----

const inputRef = ref<HTMLInputElement>();
const focused = ref(false);
const displayValue = ref(String(props.modelValue ?? ''));
let userInput = false;

watch(() => props.modelValue, (val) => {
  if (!userInput && val !== undefined && val !== null) {
    displayValue.value = String(val);
  }
});

// ---- Value operations ----

function increase() {
  if (_disabled.value) return;
  const current = props.modelValue ?? 0;
  const newVal = clamp(current + props.step);
  if (newVal !== current) {
    emit('update:modelValue', newVal);
    emit('change', newVal);
    formItem?.validate('change');
  }
  userInput = false;
  displayValue.value = String(newVal);
}

function decrease() {
  if (_disabled.value) return;
  const current = props.modelValue ?? 0;
  const newVal = clamp(current - props.step);
  if (newVal !== current) {
    emit('update:modelValue', newVal);
    emit('change', newVal);
    formItem?.validate('change');
  }
  userInput = false;
  displayValue.value = String(newVal);
}

// ---- Event handlers ----

function handleInput(event: Event) {
  if (isComposing.value) return;
  userInput = true;
  const raw = (event.target as HTMLInputElement).value;
  displayValue.value = raw;
  // Allow intermediate states: empty, "-", "1."
  if (raw === '' || raw === '-') return;
  const parsed = parseFloat(raw);
  if (!isNaN(parsed)) {
    emit('update:modelValue', parsed);
  }
}

function handleFocus(e: FocusEvent) {
  focused.value = true;
  emit('focus', e);
}

function handleBlur(e: FocusEvent) {
  focused.value = false;
  userInput = false;
  const val = props.modelValue;
  if (val !== undefined) {
    const clamped = clamp(val);
    displayValue.value = String(clamped);
    if (clamped !== val) {
      emit('update:modelValue', clamped);
      emit('change', clamped);
    }
  }
  formItem?.validate('blur');
  emit('blur', e);
}

function onCompositionEnd(event: CompositionEvent) {
  handleCompositionEnd(event);
}

// ---- Long-press acceleration ----

let holdTimer: ReturnType<typeof setInterval> | null = null;

function onIncreaseStart() {
  increase();
  holdTimer = setInterval(increase, 150);
}

function onDecreaseStart() {
  decrease();
  holdTimer = setInterval(decrease, 150);
}

function onButtonUp() {
  if (holdTimer) {
    clearInterval(holdTimer);
    holdTimer = null;
  }
}
</script>
