import type { PropType } from 'vue';

export const collapseProps = {
  modelValue: { type: Array as PropType<(string | number)[]>, default: () => [] },
  accordion: { type: Boolean, default: false },
} as const;

export type CollapseProps = {
  modelValue?: (string | number)[];
  accordion?: boolean;
};

export const collapseItemProps = {
  name: { type: [String, Number] as PropType<string | number>, required: true },
  title: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
} as const;

export type CollapseItemProps = {
  name: string | number;
  title?: string;
  disabled?: boolean;
};
