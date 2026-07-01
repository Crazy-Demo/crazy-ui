/**
 * Button Props Definition
 */

import type { Component } from 'vue';
import type {
  ComponentSize,
  ComponentVariant,
  ComponentColor,
  NativeButtonType,
} from '@crazy-ui/core';

export interface ButtonProps {
  size?: ComponentSize;
  variant?: ComponentVariant;
  color?: ComponentColor;
  disabled?: boolean;
  loading?: boolean;
  nativeType?: NativeButtonType;
  /** Icon component displayed before button text */
  icon?: Component;
  /** Custom loading icon, replaces default spinner */
  loadingIcon?: Component;
  /** Circle shape — equal width/height, border-radius 50% */
  circle?: boolean;
}

export const buttonProps = {
  size: {
    type: String as () => ComponentSize,
    default: 'medium',
  },
  variant: {
    type: String as () => ComponentVariant,
    default: 'solid',
  },
  color: {
    type: String as () => ComponentColor,
    default: 'primary',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  nativeType: {
    type: String as () => NativeButtonType,
    default: 'button',
  },
  icon: {
    type: Object,
    default: undefined,
  },
  loadingIcon: {
    type: Object,
    default: undefined,
  },
  circle: {
    type: Boolean,
    default: false,
  },
} as const;
