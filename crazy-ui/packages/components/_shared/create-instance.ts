/**
 * Programmatic component mounting utility.
 * Used by Message, Notification, and other imperative API components.
 *
 * Pattern based on vLoading directive implementation.
 */

import { createApp, type Component, type App } from 'vue';

export interface MountInstanceOptions {
  component: Component;
  props?: Record<string, any>;
  container?: HTMLElement;
}

export interface MountedInstance {
  app: App;
  el: HTMLElement;
  instance: any;
  close: () => void;
}

export function mountInstance(options: MountInstanceOptions): MountedInstance {
  const { component, props = {}, container } = options;

  const mountNode = document.createElement('div');
  const targetContainer = container ?? document.body;

  const app = createApp(component, props);
  const instance = app.mount(mountNode);

  targetContainer.appendChild(instance.$el);

  return {
    app,
    el: instance.$el as HTMLElement,
    instance,
    close() {
      app.unmount();
      if (instance.$el?.parentNode) {
        instance.$el.parentNode.removeChild(instance.$el);
      }
    },
  };
}
