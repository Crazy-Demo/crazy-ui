/**
 * Switch Component Entry
 */

import Switch from './src/switch.vue';
import type { ComponentSize } from '@crazy-ui/core';

export { Switch };

export type SwitchProps = {
  modelValue?: boolean | string | number;
  disabled?: boolean;
  size?: ComponentSize;
  loading?: boolean;
  activeValue?: boolean | string | number;
  inactiveValue?: boolean | string | number;
  activeText?: string;
  inactiveText?: string;
  activeIcon?: string;
  inactiveIcon?: string;
  inlinePrompt?: boolean;
  beforeChange?: (newVal: boolean | string | number) => boolean | Promise<boolean>;
  name?: string;
};

export default Switch;
