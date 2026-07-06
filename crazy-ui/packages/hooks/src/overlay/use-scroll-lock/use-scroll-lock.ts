import { watch, onBeforeUnmount, type Ref } from 'vue';

let lockCount = 0;

export interface UseScrollLockOptions {
  locked: Ref<boolean>;
  container?: Ref<HTMLElement | undefined>;
}

export function useScrollLock(options: UseScrollLockOptions) {
  let originalOverflow = '';
  let originalPaddingRight = '';

  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  function lock() {
    const target = options.container?.value ?? document.body;
    lockCount++;
    if (lockCount === 1) {
      originalOverflow = target.style.overflow;
      originalPaddingRight = target.style.paddingRight;
      const sw = getScrollbarWidth();
      target.style.overflow = 'hidden';
      if (sw > 0) target.style.paddingRight = `${sw}px`;
    }
  }

  function unlock() {
    if (lockCount <= 0) return;
    lockCount--;
    if (lockCount === 0) {
      const target = options.container?.value ?? document.body;
      target.style.overflow = originalOverflow;
      target.style.paddingRight = originalPaddingRight;
    }
  }

  watch(
    () => options.locked.value,
    (isLocked) => (isLocked ? lock() : unlock())
  );
  onBeforeUnmount(() => {
    if (options.locked.value) unlock();
  });
}
