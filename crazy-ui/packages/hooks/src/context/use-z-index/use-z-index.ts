import { ref, inject, provide, type InjectionKey, type Ref } from 'vue';
import { zIndexCounterInjectionKey } from '@crazy-ui/core';

const DEFAULT_INITIAL_Z_INDEX = 2000;

export function useZIndex(initialZIndex?: number) {
  const injectedCounter = inject(
    zIndexCounterInjectionKey as unknown as InjectionKey<Ref<number>>,
    undefined,
  );

  if (injectedCounter) {
    const nextZIndex = () => {
      injectedCounter.value++;
      return injectedCounter.value;
    };
    return { currentZIndex: injectedCounter, nextZIndex };
  }

  const localCounter = ref(initialZIndex ?? DEFAULT_INITIAL_Z_INDEX);
  const nextZIndex = () => {
    localCounter.value++;
    return localCounter.value;
  };
  provide(zIndexCounterInjectionKey as unknown as InjectionKey<Ref<number>>, localCounter);

  return { currentZIndex: localCounter, nextZIndex };
}
