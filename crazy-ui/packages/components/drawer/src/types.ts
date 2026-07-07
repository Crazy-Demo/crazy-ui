import type { PropType } from 'vue';

export const drawerProps = {
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '400px' },
  direction: { type: String as PropType<'left' | 'right' | 'top' | 'bottom'>, default: 'right' },
  closable: { type: Boolean, default: true },
  closeOnClickModal: { type: Boolean, default: true },
  closeOnPressEscape: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  modal: { type: Boolean, default: true },
} as const;

export type DrawerProps = {
  modelValue?: boolean;
  title?: string;
  width?: string;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  closable?: boolean;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  showHeader?: boolean;
  modal?: boolean;
};
