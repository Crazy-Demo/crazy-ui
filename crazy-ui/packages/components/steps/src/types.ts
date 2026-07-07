import type { PropType, Ref } from 'vue';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export const stepsProps = {
  active: { type: Number, default: 0 },
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
  finishStatus: {
    type: String as PropType<StepStatus>,
    default: 'finish',
  },
} as const;

export const stepProps = {
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  status: {
    type: String as PropType<StepStatus>,
    default: undefined,
  },
  index: { type: Number, default: undefined },
} as const;

export type StepsProps = {
  active?: number;
  direction?: 'horizontal' | 'vertical';
  finishStatus?: StepStatus;
};

export type StepProps = {
  title?: string;
  description?: string;
  status?: StepStatus;
  index?: number;
};

export interface StepsContext {
  active: Ref<number>;
  finishStatus: Ref<StepStatus>;
}
