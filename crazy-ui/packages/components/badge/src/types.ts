import type { PropType } from 'vue';

export const badgeProps = {
  value: { type: [String, Number] as PropType<string | number>, default: '' },
  max: { type: Number, default: 99 },
  isDot: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  type: {
    type: String as PropType<'primary' | 'success' | 'warning' | 'danger' | 'info'>,
    default: 'danger',
  },
} as const;

export type BadgeProps = {
  value?: string | number;
  max?: number;
  isDot?: boolean;
  hidden?: boolean;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
};
