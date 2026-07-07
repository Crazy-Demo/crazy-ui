import type { PropType } from 'vue';

export const rateProps = {
  modelValue: { type: Number, default: 0 },
  max: { type: Number, default: 5 },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  allowHalf: { type: Boolean, default: false },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium',
  },
  color: { type: String, default: undefined },
  voidColor: { type: String, default: undefined },
  disabledVoidColor: { type: String, default: undefined },
  showText: { type: Boolean, default: false },
  texts: {
    type: Array as PropType<string[]>,
    default: undefined,
  },
  showScore: { type: Boolean, default: false },
  scoreTemplate: { type: String, default: '{value}' },
  lowThreshold: { type: Number, default: 2 },
  highThreshold: { type: Number, default: 4 },
  voidIcon: { type: String, default: undefined },
  halfIcon: { type: String, default: undefined },
  icon: { type: String, default: undefined },
} as const;

export const rateEmits = {
  'update:modelValue': (val: number) => typeof val === 'number',
  change: (val: number) => typeof val === 'number',
};

export type RateProps = {
  modelValue?: number;
  max?: number;
  disabled?: boolean;
  readonly?: boolean;
  allowHalf?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  voidColor?: string;
  disabledVoidColor?: string;
  showText?: boolean;
  texts?: string[];
  showScore?: boolean;
  scoreTemplate?: string;
  lowThreshold?: number;
  highThreshold?: number;
  voidIcon?: string;
  halfIcon?: string;
  icon?: string;
};
