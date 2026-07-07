export const breadcrumbProps = {
  separator: { type: String, default: '/' },
} as const;

export type BreadcrumbProps = {
  separator?: string;
};

export const breadcrumbItemProps = {
  to: { type: [String, Object] as import('vue').PropType<string | Record<string, unknown>>, default: undefined },
  separator: { type: String, default: '/' },
  isLast: { type: Boolean, default: false },
} as const;

export type BreadcrumbItemProps = {
  to?: string | Record<string, unknown>;
  separator?: string;
  isLast?: boolean;
};
