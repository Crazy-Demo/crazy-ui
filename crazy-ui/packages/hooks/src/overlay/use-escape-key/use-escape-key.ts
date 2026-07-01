import { onMounted, onBeforeUnmount, type Ref } from 'vue';

export interface UseEscapeKeyOptions {
  enabled: Ref<boolean>;
  onEscape: () => void;
}

export function useEscapeKey(options: UseEscapeKeyOptions) {
  function listener(event: KeyboardEvent) {
    if (event.key === 'Escape' && options.enabled.value) {
      event.stopPropagation();
      options.onEscape();
    }
  }
  onMounted(() => document.addEventListener('keydown', listener));
  onBeforeUnmount(() => document.removeEventListener('keydown', listener));
}
