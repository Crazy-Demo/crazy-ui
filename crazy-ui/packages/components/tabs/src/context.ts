/**
 * Tabs Context - Injection key and type interface for Tabs component family
 */

import type { Ref } from 'vue';
import type { TabsType, TabPosition, TabPaneState } from './types';

export interface TabsContext {
  active: Ref<string | number>;
  type: Ref<TabsType>;
  position: Ref<TabPosition>;
  closable: Ref<boolean>;
  lazy: Ref<boolean>;
  stretch: Ref<boolean>;
  addable: Ref<boolean>;
  panes: Ref<TabPaneState[]>;
  registerPane: (pane: TabPaneState) => void;
  unregisterPane: (name: string | number) => void;
  selectTab: (name: string | number) => void;
  closeTab: (name: string | number) => void;
}

export const tabsInjectionKey: unique symbol = Symbol('tabs');
