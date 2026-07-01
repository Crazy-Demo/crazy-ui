/**
 * Checkbox + CheckboxGroup Types and Props
 */

import type { PropType, Ref } from 'vue';
import type { ComponentSize } from '@crazy-ui/core';

// ============ Checkbox Props & Emits ============

export const checkboxProps = {
  modelValue: {
    type: [Boolean, String, Number, Array] as PropType<
      boolean | string | number | (string | number)[]
    >,
    default: undefined,
  },
  label: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
    default: undefined,
  },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  border: { type: Boolean, default: false },
  indeterminate: { type: Boolean, default: false },
  trueValue: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
    default: true,
  },
  falseValue: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
    default: false,
  },
  name: { type: String, default: undefined },
} as const;

export const checkboxEmits = {
  'update:modelValue': (
    _value: boolean | string | number | (string | number)[],
  ) => true,
  change: (_value: boolean | string | number | (string | number)[]) => true,
};

// ============ CheckboxGroup Context, Props & Emits ============

export interface CheckboxGroupContext {
  modelValue: Ref<(string | number)[]>;
  disabled: Ref<boolean>;
  size: Ref<ComponentSize | undefined>;
  min: Ref<number | undefined>;
  max: Ref<number | undefined>;
  changeEvent: (value: (string | number)[]) => void;
}

export const checkboxGroupInjectionKey: unique symbol = Symbol('checkboxGroup');

export const checkboxGroupProps = {
  modelValue: {
    type: Array as PropType<(string | number)[]>,
    default: () => [] as (string | number)[],
  },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
} as const;

export const checkboxGroupEmits = {
  'update:modelValue': (_value: (string | number)[]) => true,
  change: (_value: (string | number)[]) => true,
};
