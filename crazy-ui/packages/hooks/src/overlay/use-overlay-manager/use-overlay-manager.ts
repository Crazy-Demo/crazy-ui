import { inject, provide, reactive, type InjectionKey } from 'vue';
import { overlayManagerInjectionKey } from '@crazy-ui/core';

export interface OverlayInstance {
  id: string;
  close: () => void;
}

export interface OverlayManagerContext {
  stack: OverlayInstance[];
  register: (instance: OverlayInstance) => void;
  unregister: (id: string) => void;
  closeTopByEsc: () => void;
}

export function useOverlayManager() {
  const parentManager = inject<OverlayManagerContext | undefined>(
    overlayManagerInjectionKey as unknown as InjectionKey<OverlayManagerContext>,
    undefined,
  );

  const manager = reactive<OverlayManagerContext>({
    stack: [...(parentManager?.stack ?? [])],
    register(instance) { manager.stack.push(instance); },
    unregister(id) {
      const idx = manager.stack.findIndex((i) => i.id === id);
      if (idx > -1) manager.stack.splice(idx, 1);
    },
    closeTopByEsc() {
      for (let i = manager.stack.length - 1; i >= 0; i--) {
        manager.stack[i].close();
        return;
      }
    },
  });

  provide(overlayManagerInjectionKey as unknown as InjectionKey<OverlayManagerContext>, manager);
  return manager;
}
