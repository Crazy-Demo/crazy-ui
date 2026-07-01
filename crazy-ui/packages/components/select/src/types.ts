import type { PropType, Component } from 'vue';
import type { ComponentSize, Placement } from '@crazy-ui/core';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export const selectProps = {
  modelValue: { type: [String, Number, Object, Array] as PropType<any>, default: undefined },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  placeholder: { type: String, default: '请选择' },
  multiple: { type: Boolean, default: false },
  filterable: { type: Boolean, default: false },
  allowCreate: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  placement: { type: String as PropType<Placement>, default: 'bottom-start' },
  options: { type: Array as PropType<SelectOption[]>, default: undefined },
  collapseTags: { type: Boolean, default: false },
  maxCollapseTags: { type: Number, default: 1 },
  popperMaxHeight: { type: Number, default: 274 },
  remote: { type: Boolean, default: false },
  remoteMethod: { type: Function as PropType<(query: string) => Promise<void>>, default: undefined },
} as const;

export const selectEmits = {
  'update:modelValue': (_value: any) => true,
  change: (_value: any) => true,
  'visible-change': (_visible: boolean) => true,
  'remove-tag': (_value: string | number) => true,
  clear: () => true,
  focus: (_e: FocusEvent) => true,
  blur: (_e: FocusEvent) => true,
};
