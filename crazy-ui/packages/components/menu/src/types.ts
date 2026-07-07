/**
 * Menu Component Types
 */

import type { PropType } from 'vue';

export type MenuMode = 'horizontal' | 'vertical';
export type SubMenuTrigger = 'hover' | 'click';

export const menuProps = {
  active: { type: [String, Number] as PropType<string | number>, default: undefined },
  defaultActive: { type: [String, Number] as PropType<string | number>, default: undefined },
  mode: { type: String as PropType<MenuMode>, default: 'vertical' },
  collapse: { type: Boolean, default: false },
  backgroundColor: { type: String, default: undefined },
  textColor: { type: String, default: undefined },
  activeTextColor: { type: String, default: undefined },
  uniqueOpened: { type: Boolean, default: false },
  subMenuTrigger: { type: String as PropType<SubMenuTrigger>, default: 'hover' },
  collapseWidth: { type: Number, default: 64 },
  expandWidth: { type: Number, default: 220 },
  router: { type: Boolean, default: false },
} as const;

export const menuItemProps = {
  index: { type: [String, Number] as PropType<string | number>, required: true },
  to: { type: [String, Object] as PropType<string | Record<string, unknown>>, default: undefined },
  replace: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
} as const;

export const subMenuProps = {
  index: { type: [String, Number] as PropType<string | number>, required: true },
  disabled: { type: Boolean, default: false },
  showTimeout: { type: Number, default: 300 },
  hideTimeout: { type: Number, default: 300 },
} as const;

export const menuItemGroupProps = {
  title: { type: String, default: undefined },
} as const;

export const menuEmits = {
  'update:active': (_value: string | number) => true,
  change: (_value: string | number) => true,
  open: (_index: string | number) => true,
  close: (_index: string | number) => true,
  select: (_index: string | number) => true,
};

export const menuItemEmits = {
  click: (_event: MouseEvent) => true,
};
