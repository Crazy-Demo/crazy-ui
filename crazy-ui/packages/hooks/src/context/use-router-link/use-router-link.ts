import { inject, computed, type InjectionKey, type Ref } from 'vue';

// Define the key locally since it may not be in core yet
export const routerLinkInjectionKey: unique symbol = Symbol('routerLink');

export interface RouterLike {
  currentRoute: Ref<{ path?: string; name?: string }>;
  push: (to: string | Record<string, unknown>) => void;
  replace: (to: string | Record<string, unknown>) => void;
}

export interface UseRouterLinkOptions {
  to?: Ref<string | Record<string, unknown> | undefined>;
  replace?: Ref<boolean>;
}

export function useRouterLink(options: UseRouterLinkOptions = {}) {
  const router = inject<RouterLike | undefined>(
    routerLinkInjectionKey as unknown as InjectionKey<RouterLike>,
    undefined,
  );

  const isActive = computed(() => {
    if (!router || !options.to?.value) return false;
    const currentRoute = router.currentRoute.value;
    const to = options.to.value;
    if (typeof to === 'string') return currentRoute.path === to;
    if ((to as any).name) return currentRoute.name === (to as any).name;
    if ((to as any).path) return currentRoute.path === (to as any).path;
    return false;
  });

  const navigate = () => {
    if (!router || !options.to?.value) return;
    if (options.replace?.value) {
      router.replace(options.to.value);
    } else {
      router.push(options.to.value);
    }
  };

  return { isActive, navigate, router: router ?? null };
}
