import { onMounted, onBeforeUnmount, type Ref } from 'vue';

export interface UseClickOutsideOptions {
  target: Ref<HTMLElement | undefined>;
  exclude?: Ref<HTMLElement | HTMLElement[] | undefined>;
  handler: (event: MouseEvent) => void;
  event?: 'mousedown' | 'pointerdown' | 'click';
}

export function useClickOutside(options: UseClickOutsideOptions) {
  const eventType = options.event ?? 'mousedown';

  function isInside(event: MouseEvent, element: HTMLElement): boolean {
    if (event.composedPath) return event.composedPath().includes(element);
    return element.contains(event.target as Node);
  }

  function listener(event: MouseEvent) {
    const target = options.target.value;
    if (!target) return;
    if (isInside(event, target)) return;

    const excludeEl = options.exclude?.value;
    if (excludeEl) {
      const excludes = Array.isArray(excludeEl) ? excludeEl : [excludeEl];
      if (excludes.some((el) => el && isInside(event, el))) return;
    }
    options.handler(event);
  }

  onMounted(() => document.addEventListener(eventType, listener));
  onBeforeUnmount(() => document.removeEventListener(eventType, listener));
}
