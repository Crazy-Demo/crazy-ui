import type { PropType } from 'vue';

export type SkeletonVariant =
  | 'text'
  | 'title'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'caption'
  | 'button'
  | 'image'
  | 'circle'
  | 'rect'
  | 'avatar'
  | 'input';

export const skeletonProps = {
  loading: { type: Boolean, default: true },
  animated: { type: Boolean, default: false },
  count: { type: Number, default: 1 },
  rows: { type: Number, default: 3 },
} as const;

export const skeletonItemProps = {
  variant: {
    type: String as PropType<SkeletonVariant>,
    default: 'text',
  },
} as const;

export type SkeletonProps = {
  loading?: boolean;
  animated?: boolean;
  count?: number;
  rows?: number;
};

export type SkeletonItemProps = {
  variant?: SkeletonVariant;
};
