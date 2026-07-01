/**
 * Tabs Component Types
 */

import type { PropType } from 'vue';

export type TabsType = 'line' | 'card' | 'border-card';
export type TabPosition = 'top' | 'bottom' | 'left' | 'right';

export const tabsProps = {
  active: { type: [String, Number] as PropType<string | number>, default: undefined },
  defaultActive: { type: [String, Number] as PropType<string | number>, default: undefined },
  type: { type: String as PropType<TabsType>, default: 'line' },
  position: { type: String as PropType<TabPosition>, default: 'top' },
  closable: { type: Boolean, default: false },
  addable: { type: Boolean, default: false },
  editable: { type: Boolean, default: false },
  beforeLeave: {
    type: Function as PropType<
      (newName: string | number, oldName: string | number) => boolean | Promise<boolean>
    >,
    default: undefined,
  },
  lazy: { type: Boolean, default: false },
  stretch: { type: Boolean, default: false },
} as const;

export const tabPaneProps = {
  name: { type: [String, Number] as PropType<string | number>, required: true },
  title: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  closable: { type: Boolean, default: undefined },
  lazy: { type: Boolean, default: undefined },
  cache: { type: Boolean, default: true },
} as const;

export const tabsEmits = {
  'update:active': (value: string | number) => true,
  change: (value: string | number) => true,
  close: (name: string | number) => true,
  add: () => true,
  'tab-click': (name: string | number, event: MouseEvent) => true,
};

export interface TabPaneState {
  name: string | number;
  title: string;
  disabled: boolean;
  closable: boolean | undefined;
  lazy: boolean | undefined;
  cache: boolean;
}
