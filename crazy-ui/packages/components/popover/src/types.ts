import type { PropType } from 'vue';
import type { Placement } from '@crazy-ui/core';

export const popoverProps = {
  visible: { type: Boolean, default: undefined },
  placement: { type: String as PropType<Placement>, default: 'bottom' },
  trigger: { type: String as PropType<'click' | 'hover'>, default: 'click' },
  width: { type: [String, Number] as PropType<string | number>, default: undefined },
  offset: { type: Number, default: 8 },
  disabled: { type: Boolean, default: false },
  showArrow: { type: Boolean, default: true },
  teleported: { type: Boolean, default: true },
} as const;

export type PopoverProps = {
  visible?: boolean;
  placement?: Placement;
  trigger?: 'click' | 'hover';
  width?: string | number;
  offset?: number;
  disabled?: boolean;
  showArrow?: boolean;
  teleported?: boolean;
};

export const popoverEmits = {
  'update:visible': (_val: boolean) => true,
  show: () => true,
  hide: () => true,
};
