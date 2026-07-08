import { onBeforeUnmount, ref, watch, type Ref } from 'vue';

export interface UseResizeObserverOptions {
  target: Ref<HTMLElement | undefined>;
  onResize: (entry: ResizeObserverEntry) => void;
}

export function useResizeObserver(options: UseResizeObserverOptions) {
  const { target, onResize } = options;
  const observer = ref<ResizeObserver | null>(null);

  function start() {
    stop();
    if (typeof ResizeObserver === 'undefined') return;
    observer.value = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onResize(entry);
      }
    });
    if (target.value) {
      observer.value.observe(target.value);
    }
  }

  function stop() {
    if (observer.value) {
      observer.value.disconnect();
      observer.value = null;
    }
  }

  watch(
    () => target.value,
    (el) => {
      stop();
      if (el && typeof ResizeObserver !== 'undefined') {
        observer.value = new ResizeObserver((entries) => {
          for (const entry of entries) {
            onResize(entry);
          }
        });
        observer.value.observe(el);
      }
    },
  );

  onBeforeUnmount(() => stop());

  return { start, stop };
}
