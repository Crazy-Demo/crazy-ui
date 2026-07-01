import { ref, getCurrentInstance } from 'vue';

let idCounter = 0;

export interface UseIdOptions {
  prefix?: string;
}

export function useId(options: UseIdOptions = {}) {
  const prefix = options.prefix ?? 'crazy';

  // 优先使用 Vue 3.5+ 内置 useId（SSR/client 一致性保证）
  const instance = getCurrentInstance();
  if (instance?.appContext?.config?.globalProperties?.$id) {
    return { id: ref((instance.appContext.config.globalProperties.$id as () => string)()) };
  }

  // fallback: 使用组件 uid + 计数器确保 SSR/client 一致性
  const uid = instance?.uid ?? ++idCounter;
  const id = ref(`${prefix}-${uid}`);

  return { id };
}
