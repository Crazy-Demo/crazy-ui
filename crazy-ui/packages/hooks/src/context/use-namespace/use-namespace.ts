import { inject, unref, type InjectionKey, type Ref } from 'vue';
import { namespaceInjectionKey } from '@crazy-ui/core';

export const defaultNamespace = 'crazy';

const statePrefix = 'is-';

export function useNamespace(block: string) {
  const namespace = inject(
    namespaceInjectionKey as unknown as InjectionKey<string>,
    defaultNamespace,
  );

  const b = () => `${namespace}-${block}`;

  const e = (element: string) => `${b()}__${element}`;

  const m = (modifier: string) => `${b()}--${modifier}`;

  const em = (element: string, modifier: string) => `${e(element)}--${modifier}`;

  const is = (name: string, ...args: [boolean | Ref<boolean>] | []) => {
    const state = args.length ? unref(args[0]) : true;
    return state ? `${statePrefix}${name}` : '';
  };

  const cssVar = (object: Record<string, string>) => {
    const styles: Record<string, string> = {};
    for (const key in object) {
      styles[`--${namespace}-${block}-${key}`] = object[key];
    }
    return styles;
  };

  const cssVarBlock = (object: Record<string, string>) => {
    const styles: Record<string, string> = {};
    for (const key in object) {
      styles[`--${b()}-${key}`] = object[key];
    }
    return styles;
  };

  return {
    namespace,
    b,
    e,
    m,
    em,
    is,
    cssVar,
    cssVarBlock,
  };
}
