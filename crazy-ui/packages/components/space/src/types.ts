import type { PropType } from 'vue';

export const spaceProps = {
  direction: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  align: { type: String as PropType<'start' | 'center' | 'end'>, default: 'start' },
  size: { type: [String, Number] as PropType<string | number>, default: 'medium' },
  wrap: { type: Boolean, default: false },
} as const;

export type SpaceProps = {
  direction?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end';
  size?: string | number;
  wrap?: boolean;
};
