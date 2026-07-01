/**
 * Menu Context - Injection keys and type interfaces for Menu component family
 */

import type { Ref } from 'vue';
import type { MenuMode, SubMenuTrigger } from './types';

export interface MenuContext {
  active: Ref<string | number>;
  mode: Ref<MenuMode>;
  collapse: Ref<boolean>;
  uniqueOpened: Ref<boolean>;
  subMenuTrigger: Ref<SubMenuTrigger>;
  openedSubMenus: Ref<Set<string | number>>;
  registerItem: (index: string | number) => void;
  unregisterItem: (index: string | number) => void;
  selectItem: (index: string | number) => void;
  openSubMenu: (index: string | number) => void;
  closeSubMenu: (index: string | number) => void;
  backgroundColor: Ref<string | undefined>;
  textColor: Ref<string | undefined>;
  activeTextColor: Ref<string | undefined>;
}

export const menuInjectionKey: unique symbol = Symbol('menu');

export interface SubMenuContext {
  parentIndex: string | number;
  level: number;
}

export const subMenuInjectionKey: unique symbol = Symbol('subMenu');
