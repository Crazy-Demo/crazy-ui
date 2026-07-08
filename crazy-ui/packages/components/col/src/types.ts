import type { PropType } from 'vue';

export interface ColFlex {
  span?: number;
  offset?: number;
  push?: number;
  pull?: number;
}

const responsiveValidator = (v: any) =>
  typeof v === 'number' || (typeof v === 'object' && v !== null);

export const colProps = {
  span: { type: Number, default: 24 },
  offset: { type: Number, default: 0 },
  push: { type: Number, default: 0 },
  pull: { type: Number, default: 0 },
  xs: {
    type: [Number, Object] as PropType<number | ColFlex>,
    default: undefined,
    validator: responsiveValidator,
  },
  sm: {
    type: [Number, Object] as PropType<number | ColFlex>,
    default: undefined,
    validator: responsiveValidator,
  },
  md: {
    type: [Number, Object] as PropType<number | ColFlex>,
    default: undefined,
    validator: responsiveValidator,
  },
  lg: {
    type: [Number, Object] as PropType<number | ColFlex>,
    default: undefined,
    validator: responsiveValidator,
  },
  xl: {
    type: [Number, Object] as PropType<number | ColFlex>,
    default: undefined,
    validator: responsiveValidator,
  },
  xxl: {
    type: [Number, Object] as PropType<number | ColFlex>,
    default: undefined,
    validator: responsiveValidator,
  },
  flex: { type: [String, Number] as PropType<string | number>, default: undefined },
  tag: { type: String, default: 'div' },
} as const;

export type ColProps = {
  span?: number;
  offset?: number;
  push?: number;
  pull?: number;
  xs?: number | ColFlex;
  sm?: number | ColFlex;
  md?: number | ColFlex;
  lg?: number | ColFlex;
  xl?: number | ColFlex;
  xxl?: number | ColFlex;
  flex?: string | number;
  tag?: string;
};
