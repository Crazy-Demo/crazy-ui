export const loadingProps = {
  loading: { type: Boolean, default: true },
  text: { type: String, default: undefined },
  fullscreen: { type: Boolean, default: false },
  background: { type: String, default: undefined },
  spinner: { type: Boolean, default: true },
} as const;

export type LoadingProps = {
  loading?: boolean;
  text?: string;
  fullscreen?: boolean;
  background?: string;
  spinner?: boolean;
};
