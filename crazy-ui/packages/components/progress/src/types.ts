import type { PropType } from 'vue';

export const progressProps = {
  percentage: { type: Number, default: 0 },
  strokeWidth: { type: Number, default: 6 },
  color: { type: String, default: undefined },
  showText: { type: Boolean, default: true },
  status: {
    type: String as PropType<'success' | 'warning' | 'exception'>,
    default: undefined,
  },
} as const;

export type ProgressProps = {
  percentage?: number;
  strokeWidth?: number;
  color?: string;
  showText?: boolean;
  status?: 'success' | 'warning' | 'exception';
};
