import { describe, it, expect, vi } from 'vitest';
import { ref, provide } from 'vue';
import { useRouterLink, routerLinkInjectionKey, type RouterLike } from '../src/context/use-router-link';

describe('useRouterLink', () => {
  it('returns isActive=false when no router injected', () => {
    const { isActive, router } = useRouterLink({ to: ref('/home') });
    expect(isActive.value).toBe(false);
    expect(router).toBeNull();
  });

  it('navigate is no-op without router', () => {
    const { navigate } = useRouterLink({ to: ref('/home') });
    expect(() => navigate()).not.toThrow();
  });
});
