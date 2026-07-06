import { onBeforeUnmount, type Ref } from 'vue';

export interface UseFocusTrapOptions {
  containerRef: Ref<HTMLElement | undefined>;
  enabled: Ref<boolean>;
  initialFocus?: Ref<HTMLElement | string | undefined>;
}

// CSS selector for focusable elements
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useFocusTrap(options: UseFocusTrapOptions) {
  let previouslyFocused: HTMLElement | null = null;

  function getFocusable(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => (el as HTMLElement).offsetParent !== null
    );
  }

  function onFocusIn(e: FocusEvent) {
    const container = options.containerRef.value;
    if (!container || !options.enabled.value) return;
    if (container.contains(e.target as HTMLElement)) return;
    // Focus escaped — trap it back
    const focusable = getFocusable(container);
    if (focusable.length) focusable[0].focus();
  }

  function activate() {
    previouslyFocused = document.activeElement as HTMLElement;
    const container = options.containerRef.value;
    if (!container) return;

    // Initial focus
    const initial = options.initialFocus?.value;
    if (initial instanceof HTMLElement) {
      initial.focus();
    } else if (typeof initial === 'string') {
      container.querySelector<HTMLElement>(initial)?.focus();
    } else {
      const focusable = getFocusable(container);
      if (focusable.length) focusable[0].focus();
    }

    document.addEventListener('focusin', onFocusIn);
  }

  function deactivate() {
    document.removeEventListener('focusin', onFocusIn);
    previouslyFocused?.focus();
    previouslyFocused = null;
  }

  onBeforeUnmount(() => deactivate());

  return { activate, deactivate };
}
