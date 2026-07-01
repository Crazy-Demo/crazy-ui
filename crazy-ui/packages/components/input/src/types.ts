// packages/components/input/src/types.ts
import type { PropType } from 'vue';
import type { ComponentSize } from '@crazy-ui/core';

export type InputType = 'text' | 'password' | 'textarea' | 'url' | 'email';
export type Autosize = boolean | { minRows?: number; maxRows?: number };

export const inputProps = {
  modelValue: { type: [String, Number] as PropType<string | number>, default: '' },
  type: { type: String as PropType<InputType>, default: 'text' },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  status: { type: String as PropType<'' | 'success' | 'error' | 'warning'>, default: '' },
  placeholder: { type: String, default: undefined },
  prefixIcon: { type: String, default: undefined },
  suffixIcon: { type: String, default: undefined },
  maxlength: { type: [Number, String] as PropType<number | string>, default: undefined },
  minlength: { type: [Number, String] as PropType<number | string>, default: undefined },
  showWordLimit: { type: Boolean, default: false },
  showPassword: { type: Boolean, default: false },
  autosize: { type: [Boolean, Object] as PropType<Autosize>, default: false },
  rows: { type: Number, default: 2 },
  name: { type: String, default: undefined },
} as const;

export const inputEmits = {
  'update:modelValue': (_value: string | number) => true,
  input: (_value: string) => true,
  change: (_value: string | number) => true,
  focus: (_event: FocusEvent) => true,
  blur: (_event: FocusEvent) => true,
  clear: () => true,
};
