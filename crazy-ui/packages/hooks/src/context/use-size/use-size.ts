import { inject, computed, unref, type InjectionKey, type Ref } from 'vue';
import { sizeInjectionKey, type ComponentSize } from '@crazy-ui/core';

export function useSize(fallback?: Ref<ComponentSize> | ComponentSize) {
  const injectedSize = inject(
    sizeInjectionKey as unknown as InjectionKey<ComponentSize>,
    undefined,
  );

  return computed<ComponentSize>(() => {
    return injectedSize ?? unref(fallback) ?? 'medium';
  });
}
