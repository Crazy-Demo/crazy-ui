import type { PropType } from 'vue';
import type { Placement } from '@crazy-ui/core';

export const dropdownProps = {
  modelValue: { type: Boolean, default: false },
  trigger: {
    type: String as PropType<'click' | 'hover'>,
    default: 'click',
  },
  placement: {
    type: String as PropType<Placement>,
    default: 'bottom-start',
  },
  disabled: { type: Boolean, default: false },
  hideOnClick: { type: Boolean, default: true },
} as const;

export const dropdownEmits = {
  'update:modelValue': (_value: boolean) => true,
  'visible-change': (_visible: boolean) => true,
};

export type DropdownProps = {
  modelValue?: boolean;
  trigger?: 'click' | 'hover';
  placement?: Placement;
  disabled?: boolean;
  hideOnClick?: boolean;
};
