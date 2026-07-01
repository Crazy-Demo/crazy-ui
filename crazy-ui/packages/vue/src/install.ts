import type { App, Plugin } from 'vue';

/**
 * Create a Vue plugin that installs all provided components.
 * Each component must have an `install` method (from withInstall).
 */
export function makeInstaller(components: Plugin[] = []): Plugin {
  return {
    install(app: App) {
      for (const component of components) {
        app.use(component);
      }
    },
  };
}
