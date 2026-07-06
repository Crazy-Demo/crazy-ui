import type { PropType } from 'vue';

export const tagProps = {
  type: {
    type: String as PropType<'primary' | 'success' | 'warning' | 'danger' | 'info'>,
    default: 'info',
  },
  closable: { type: Boolean, default: false },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium',
  },
  effect: {
    type: String as PropType<'light' | 'dark' | 'plain'>,
    default: 'light',
  },
  round: { type: Boolean, default: false },
  color: { type: String, default: undefined },
} as const;

export type TagProps = {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  closable?: boolean;
  size?: 'small' | 'medium' | 'large';
  effect?: 'light' | 'dark' | 'plain';
  round?: boolean;
  color?: string;
};

export const tagEmits = {
  close: (event: MouseEvent) => true,
  click: (event: MouseEvent) => true,
};
