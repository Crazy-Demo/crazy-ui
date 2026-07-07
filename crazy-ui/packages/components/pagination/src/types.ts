export const paginationProps = {
  total: { type: Number, required: true },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  pagerCount: { type: Number, default: 7 },
  disabled: { type: Boolean, default: false },
  background: { type: Boolean, default: false },
  size: { type: String as () => 'small' | 'medium' | 'large', default: 'medium' },
} as const;

export type PaginationProps = {
  total: number;
  currentPage?: number;
  pageSize?: number;
  pagerCount?: number;
  disabled?: boolean;
  background?: boolean;
  size?: 'small' | 'medium' | 'large';
};
