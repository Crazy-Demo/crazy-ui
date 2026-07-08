import type { PropType } from 'vue';

export const emptyProps = {
  image: { type: String, default: undefined },
  imageStyle: {
    type: Object as PropType<Record<string, string>>,
    default: () => ({}),
  },
  description: { type: String, default: undefined },
} as const;

export type EmptyProps = {
  image?: string;
  imageStyle?: Record<string, string>;
  description?: string;
};
