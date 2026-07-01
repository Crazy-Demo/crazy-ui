/**
 * DOM utilities — get all focusable elements within a container.
 * Used by useFocusTrap for focus trapping in modals.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'details summary',
    'audio[controls]',
    'video[controls]',
  ].join(',');

  const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
  return elements.filter(
    (el) => 'offsetParent' in el ? el.offsetParent !== null : true,
  );
}

/**
 * Check if an event target is inside a given element.
 * Uses composedPath() for correct Teleport/Shadow DOM handling,
 * falls back to contains() for older browsers.
 */
export function isInside(event: MouseEvent, element: HTMLElement): boolean {
  if (event.composedPath) {
    return event.composedPath().includes(element);
  }
  return element.contains(event.target as Node);
}
