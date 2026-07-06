import type { PropType } from 'vue';
import type { Placement } from '@crazy-ui/core';

export const tooltipProps = {
  content: { type: String, default: '' },
  placement: {
    type: String as PropType<Placement>,
    default: 'top',
  },
  disabled: { type: Boolean, default: false },
  offset: { type: Number, default: 8 },
  showAfter: { type: Number, default: 200 },
  hideAfter: { type: Number, default: 100 },
  trigger: {
    type: String as PropType<'hover' | 'click'>,
    default: 'hover',
  },
} as const;

export type TooltipProps = {
  content?: string;
  placement?: Placement;
  disabled?: boolean;
  offset?: number;
  showAfter?: number;
  hideAfter?: number;
  trigger?: 'hover' | 'click';
};
