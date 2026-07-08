import type { PropType, InjectionKey, Ref } from 'vue';

export const layoutProps = {} as const;

export const headerProps = {
  height: { type: String, default: '60px' },
} as const;

export const footerProps = {
  height: { type: String, default: '60px' },
} as const;

export const siderProps = {
  width: { type: [String, Number] as PropType<string | number>, default: '200px' },
  collapsedWidth: {
    type: [String, Number] as PropType<string | number>,
    default: '64px',
  },
  collapsible: { type: Boolean, default: false },
  collapsed: { type: Boolean, default: undefined },
  defaultCollapsed: { type: Boolean, default: false },
} as const;

export const siderEmits = {
  'update:collapsed': (_val: boolean) => true,
};

export type LayoutProps = Record<string, never>;
export type HeaderProps = { height?: string };
export type FooterProps = { height?: string };
export type SiderProps = {
  width?: string | number;
  collapsedWidth?: string | number;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
};

export const layoutHasSiderKey: InjectionKey<Ref<boolean>> =
  Symbol('layoutHasSider');
