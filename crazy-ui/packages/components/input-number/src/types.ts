/**
 * InputNumber Types & Props
 */

import type { PropType } from 'vue';
import type { ComponentSize } from '@crazy-ui/core';

export const inputNumberProps = {
  modelValue: { type: Number, default: undefined },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  disabled: { type: Boolean, default: false },
  status: { type: String as PropType<'' | 'success' | 'error' | 'warning'>, default: '' },
  min: { type: Number, default: -Infinity },
  max: { type: Number, default: Infinity },
  step: { type: Number, default: 1 },
  stepStrictly: { type: Boolean, default: false },
  precision: { type: Number, default: undefined },
  controls: { type: Boolean, default: true },
  controlsPosition: { type: String as PropType<'around' | 'right'>, default: 'around' },
  placeholder: { type: String, default: undefined },
  name: { type: String, default: undefined },
} as const;

export type InputNumberProps = typeof inputNumberProps;

export const inputNumberEmits = {
  'update:modelValue': (_value: number) => true,
  change: (_value: number) => true,
  focus: (_event: FocusEvent) => true,
  blur: (_event: FocusEvent) => true,
};
