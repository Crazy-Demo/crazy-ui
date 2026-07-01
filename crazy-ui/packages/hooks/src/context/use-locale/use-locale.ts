import { inject, type InjectionKey } from 'vue';
import { localeInjectionKey } from '@crazy-ui/core';

export type LocaleMessages = Record<string, unknown>;

export function useLocale(defaultLocale?: LocaleMessages) {
  const injected = inject(
    localeInjectionKey as unknown as InjectionKey<LocaleMessages>,
    undefined,
  );
  const locale = injected ?? defaultLocale;

  const t = (path: string, ...args: unknown[]): string => {
    if (!locale) return path;
    const value = resolvePath(locale, path);
    if (typeof value === 'function') {
      return (value as (...a: unknown[]) => string)(...args);
    }
    return (value as string) ?? path;
  };

  return { locale, t };
}

function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  const segments = path.split('.');
  let current: unknown = obj;
  for (const segment of segments) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}
