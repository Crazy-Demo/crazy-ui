import type { PropType } from 'vue';

export const cardProps = {
  title: { type: String, default: '' },
  shadow: { type: String as PropType<'always' | 'hover' | 'never'>, default: 'never' },
} as const;

export type CardProps = {
  title?: string;
  shadow?: 'always' | 'hover' | 'never';
};
