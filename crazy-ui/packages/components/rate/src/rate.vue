<template>
  <div
    :class="[
      ns.b(),
      ns.m(_size),
      {
        'is-disabled': disabled || readonly,
        'is-readonly': readonly && !disabled,
      },
    ]"
    role="radiogroup"
    :aria-label="'rating'"
    :aria-disabled="disabled || undefined"
    @mouseleave="handleMouseLeave"
  >
    <span
      v-for="(item, index) in max"
      :key="index"
      :class="[
        ns.e('item'),
        {
          'is-active': isActive(index),
          'is-half': allowHalf && isHalfActive(index),
          'is-disabled': disabled,
          'is-hover': hoverIndex !== null && index <= hoverIndex,
        },
      ]"
      :style="itemStyle(index)"
      :tabindex="disabled ? -1 : 0"
      role="radio"
      :aria-checked="isActive(index) && !isHalfActive(index)"
      :aria-label="`${index + 1} star${index > 0 ? 's' : ''}`"
      @click="handleClick(index, $event)"
      @mousemove="handleMouseMove(index, $event)"
      @mouseenter="handleMouseEnter(index)"
      @keydown="handleKeydown($event)"
    >
      <span :class="ns.e('icon')">
        <!-- Half active: show half-icon or clipped filled icon -->
        <template v-if="allowHalf && isHalfActive(index)">
          <span v-if="halfIcon" :class="ns.e('half-icon')" v-html="halfIcon" />
          <template v-else>
            <span :class="ns.e('void')">&#9733;</span>
            <span :class="ns.e('half')">&#9733;</span>
          </template>
        </template>
        <!-- Fully active -->
        <template v-else-if="isActive(index)">
          <span v-if="icon" :class="ns.e('active-icon')" v-html="icon" />
          <span v-else :class="ns.e('active')">&#9733;</span>
        </template>
        <!-- Inactive -->
        <template v-else>
          <span v-if="voidIcon" :class="ns.e('void-icon')" v-html="voidIcon" />
          <span v-else :class="ns.e('void')">&#9733;</span>
        </template>
      </span>
    </span>

    <span v-if="showText || showScore" :class="ns.e('text')">
      {{ displayText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { rateProps, rateEmits } from './types';

const props = defineProps(rateProps);
const emit = defineEmits(rateEmits);

const ns = useNamespace('rate');
const hoverIndex = ref<number | null>(null);

// ---------- Default texts ----------
const defaultTexts = ['极差', '差', '一般', '好', '极好'];

const _texts = computed(() => props.texts ?? defaultTexts);

// ---------- Size ----------
const _size = computed(() => props.size ?? 'medium');

// ---------- Active state ----------
function isActive(index: number): boolean {
  const val = hoverIndex.value !== null ? hoverIndex.value : props.modelValue;
  return index < val;
}

function isHalfActive(index: number): boolean {
  if (!props.allowHalf) return false;
  const val = hoverIndex.value !== null ? hoverIndex.value : props.modelValue;
  return index < val && index + 1 > val;
}

// ---------- Style ----------
function itemStyle(index: number): Record<string, string> {
  const style: Record<string, string> = {};

  if (props.disabled) {
    if (props.disabledVoidColor) {
      style.color = props.disabledVoidColor;
    }
    return style;
  }

  if (isActive(index)) {
    if (props.color) {
      style.color = props.color;
    }
  } else {
    if (props.voidColor) {
      style.color = props.voidColor;
    }
  }
  return style;
}

// ---------- Display text ----------
const displayText = computed(() => {
  const val = hoverIndex.value !== null ? hoverIndex.value : props.modelValue;

  if (props.showScore) {
    return props.scoreTemplate.replace('{value}', String(val));
  }

  if (props.showText && val > 0 && val <= _texts.value.length) {
    return _texts.value[Math.ceil(val) - 1] ?? '';
  }

  if (props.showText && val <= 0) {
    return '';
  }

  return '';
});

// ---------- Event handlers ----------
function handleClick(index: number, event: MouseEvent) {
  if (props.disabled || props.readonly) return;

  let newVal = index + 1;

  if (props.allowHalf) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const half = rect.width / 2;
    newVal = x <= half ? index + 0.5 : index + 1;
  }

  if (newVal === props.modelValue) {
    // Allow clearing by clicking again
    newVal = 0;
  }

  emit('update:modelValue', newVal);
  emit('change', newVal);
}

function handleMouseEnter(index: number) {
  if (props.disabled || props.readonly) return;
  hoverIndex.value = index + 1;
}

function handleMouseMove(index: number, event: MouseEvent) {
  if (props.disabled || props.readonly) return;
  if (!props.allowHalf) return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const half = rect.width / 2;
  hoverIndex.value = x <= half ? index + 0.5 : index + 1;
}

function handleMouseLeave() {
  hoverIndex.value = null;
}

// ---------- Keyboard navigation ----------
function handleKeydown(event: KeyboardEvent) {
  if (props.disabled || props.readonly) return;

  const key = event.key;
  let newVal = props.modelValue;

  if (key === 'ArrowRight' || key === 'ArrowUp') {
    event.preventDefault();
    newVal = Math.min(props.max, newVal + (props.allowHalf ? 0.5 : 1));
  } else if (key === 'ArrowLeft' || key === 'ArrowDown') {
    event.preventDefault();
    newVal = Math.max(0, newVal - (props.allowHalf ? 0.5 : 1));
  }

  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal);
    emit('change', newVal);
  }
}
</script>
