import { ref, watch, onBeforeUnmount, type Ref } from 'vue';
import type { Placement } from '@crazy-ui/core';

export interface UsePositionOptions {
  anchor: Ref<HTMLElement | undefined>;
  floating: Ref<HTMLElement | undefined>;
  placement: Ref<Placement>;
  offset?: Ref<number>;
}

export function usePosition(options: UsePositionOptions) {
  const position = ref({ x: 0, y: 0 });
  let rafId: number | null = null;

  function update() {
    const anchorEl = options.anchor.value;
    const floatingEl = options.floating.value;
    if (!anchorEl || !floatingEl) return;

    const anchorRect = anchorEl.getBoundingClientRect();
    const floatingRect = floatingEl.getBoundingClientRect();
    const offset = options.offset?.value ?? 8;
    const placement = options.placement.value;

    let x = 0, y = 0;
    switch (placement) {
      case 'top':
        x = anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2;
        y = anchorRect.top - floatingRect.height - offset;
        break;
      case 'bottom':
        x = anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2;
        y = anchorRect.bottom + offset;
        break;
      case 'bottom-start':
        x = anchorRect.left;
        y = anchorRect.bottom + offset;
        break;
      case 'bottom-end':
        x = anchorRect.right - floatingRect.width;
        y = anchorRect.bottom + offset;
        break;
      case 'top-start':
        x = anchorRect.left;
        y = anchorRect.top - floatingRect.height - offset;
        break;
      case 'top-end':
        x = anchorRect.right - floatingRect.width;
        y = anchorRect.top - floatingRect.height - offset;
        break;
      default:
        x = anchorRect.left;
        y = anchorRect.bottom + offset;
    }
    position.value = { x, y };
  }

  function scheduleUpdate() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => { update(); rafId = null; });
  }

  watch([options.anchor, options.floating, options.placement], scheduleUpdate);
  onBeforeUnmount(() => { if (rafId !== null) cancelAnimationFrame(rafId); });

  return { position, update };
}
