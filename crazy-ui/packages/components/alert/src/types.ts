import type { PropType } from 'vue';

export const alertProps = {
  title: { type: String, default: '' },
  type: {
    type: String as PropType<'success' | 'warning' | 'info' | 'error'>,
    default: 'info',
  },
  description: { type: String, default: '' },
  closable: { type: Boolean, default: true },
  showIcon: { type: Boolean, default: false },
  center: { type: Boolean, default: false },
  effect: {
    type: String as PropType<'light' | 'dark'>,
    default: 'light',
  },
  closeText: { type: String, default: '' },
} as const;

export const alertEmits = {
  close: (_event: MouseEvent) => true,
};

export type AlertProps = {
  title?: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  description?: string;
  closable?: boolean;
  showIcon?: boolean;
  center?: boolean;
  effect?: 'light' | 'dark';
  closeText?: string;
};
