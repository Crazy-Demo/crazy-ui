/**
 * Radio + RadioGroup + RadioButton Types and Props
 */

import type { PropType, Ref } from 'vue';
import type { ComponentSize } from '@crazy-ui/core';

// ============ Radio Props & Emits ============

export const radioProps = {
  modelValue: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
    default: undefined,
  },
  label: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
    default: undefined,
  },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  border: { type: Boolean, default: false },
  name: { type: String, default: undefined },
} as const;

export const radioEmits = {
  'update:modelValue': (_value: string | number | boolean) => true,
  change: (_value: string | number | boolean) => true,
};

// ============ RadioGroup Context, Props & Emits ============

export const radioGroupProps = {
  modelValue: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
    default: undefined,
  },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize>, default: undefined },
} as const;

export const radioGroupEmits = {
  'update:modelValue': (_value: string | number | boolean) => true,
  change: (_value: string | number | boolean) => true,
};

export interface RadioGroupContext {
  modelValue: Ref<string | number | boolean | undefined>;
  disabled: Ref<boolean>;
  size: Ref<ComponentSize | undefined>;
  changeEvent: (value: string | number | boolean) => void;
}

export const radioGroupInjectionKey: unique symbol = Symbol('radioGroup');

// ============ RadioButton Props ============

export const radioButtonProps = {
  label: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
    default: undefined,
  },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  name: { type: String, default: undefined },
} as const;
