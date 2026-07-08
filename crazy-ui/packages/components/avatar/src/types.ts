import type { PropType } from 'vue';

export const avatarProps = {
  size: {
    type: [Number, String] as PropType<number | 'small' | 'medium' | 'large'>,
    default: 'medium',
  },
  shape: {
    type: String as PropType<'circle' | 'square'>,
    default: 'circle',
  },
  src: { type: String, default: undefined },
  alt: { type: String, default: undefined },
  icon: { type: String, default: undefined },
  fallback: { type: String, default: undefined },
  fit: {
    type: String as PropType<'fill' | 'contain' | 'cover' | 'none' | 'scale-down'>,
    default: 'cover',
  },
} as const;

export type AvatarProps = {
  size?: number | 'small' | 'medium' | 'large';
  shape?: 'circle' | 'square';
  src?: string;
  alt?: string;
  icon?: string;
  fallback?: string;
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
};
