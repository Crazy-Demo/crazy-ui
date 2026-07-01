/**
 * Switch Types and Props
 */

import type { PropType } from 'vue';
import type { ComponentSize } from '@crazy-ui/core';

export const switchProps = {
  modelValue: {
    type: [Boolean, String, Number] as PropType<boolean | string | number>,
    default: false,
  },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  loading: { type: Boolean, default: false },
  activeValue: {
    type: [Boolean, String, Number] as PropType<boolean | string | number>,
    default: true,
  },
  inactiveValue: {
    type: [Boolean, String, Number] as PropType<boolean | string | number>,
    default: false,
  },
  activeText: { type: String, default: undefined },
  inactiveText: { type: String, default: undefined },
  activeIcon: { type: String, default: undefined },
  inactiveIcon: { type: String, default: undefined },
  inlinePrompt: { type: Boolean, default: false },
  beforeChange: {
    type: Function as PropType<
      (newVal: boolean | string | number) => boolean | Promise<boolean>
    >,
    default: undefined,
  },
  name: { type: String, default: undefined },
} as const;

export const switchEmits = {
  'update:modelValue': (_value: boolean | string | number) => true,
  change: (_value: boolean | string | number) => true,
};
