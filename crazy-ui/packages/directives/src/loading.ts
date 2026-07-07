import { createApp, type Directive } from 'vue';
import { Loading } from '@crazy-ui/components';

export const vLoading: Directive<HTMLElement, boolean> = {
  mounted(el, binding) {
    const app = createApp(Loading, { loading: binding.value, fullscreen: false });
    const instance = app.mount(document.createElement('div'));
    el.style.position = 'relative';
    el.appendChild(instance.$el);
    (el as any).__loadingInstance = instance;
    (el as any).__loadingApp = app;
  },
  updated(el, binding) {
    const instance = (el as any).__loadingInstance;
    if (instance) {
      instance.loading = binding.value;
    }
  },
  unmounted(el) {
    const app = (el as any).__loadingApp;
    if (app) {
      app.unmount();
    }
    delete (el as any).__loadingInstance;
    delete (el as any).__loadingApp;
  },
};
