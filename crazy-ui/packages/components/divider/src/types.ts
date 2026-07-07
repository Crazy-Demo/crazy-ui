import type { PropType } from 'vue';

export const dividerProps = {
  direction: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  dashed: { type: Boolean, default: false },
} as const;

export type DividerProps = {
  direction?: 'horizontal' | 'vertical';
  dashed?: boolean;
};
