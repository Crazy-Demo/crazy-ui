import type { PropType, InjectionKey } from 'vue';

export type RowAlign = 'top' | 'middle' | 'bottom';
export type RowJustify =
  | 'start'
  | 'end'
  | 'center'
  | 'space-around'
  | 'space-between'
  | 'space-evenly';

export const rowProps = {
  gutter: {
    type: [Number, Object] as PropType<number | Record<string, number>>,
    default: 0,
  },
  align: {
    type: String as PropType<RowAlign>,
    default: 'top',
  },
  justify: {
    type: String as PropType<RowJustify>,
    default: 'start',
  },
  wrap: { type: Boolean, default: true },
  tag: { type: String, default: 'div' },
} as const;

export type RowProps = {
  gutter?: number | Record<string, number>;
  align?: RowAlign;
  justify?: RowJustify;
  wrap?: boolean;
  tag?: string;
};

export interface RowContext {
  gutter: number;
}

export const rowInjectionKey: InjectionKey<RowContext> = Symbol('rowContext');
