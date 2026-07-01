// packages/components/input/src/use-autosize.ts
import { watch, nextTick, onMounted, onBeforeUnmount, type Ref } from 'vue';
import type { Autosize } from './types';

export function useAutosize(
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  modelValue: Ref<string | number>,
  autosize: Ref<Autosize>,
) {
  function resizeTextarea() {
    if (!autosize.value) return;
    const el = textareaRef.value;
    if (!el) return;

    el.style.height = 'auto';
    let targetHeight = el.scrollHeight;

    if (typeof autosize.value === 'object') {
      const { minRows, maxRows } = autosize.value;
      const computedStyle = getComputedStyle(el);
      let lineHeight = parseInt(computedStyle.lineHeight);
      if (isNaN(lineHeight)) {
        lineHeight = parseFloat(computedStyle.fontSize) * 1.2;
      }
      const paddingTop = parseInt(computedStyle.paddingTop) || 0;
      const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;

      if (minRows) {
        const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
        targetHeight = Math.max(targetHeight, minHeight);
      }
      if (maxRows) {
        const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;
        if (el.scrollHeight > maxHeight) {
          targetHeight = maxHeight;
          el.style.overflowY = 'auto';
        } else {
          el.style.overflowY = 'hidden';
        }
      }
    }

    el.style.height = `${targetHeight}px`;
  }

  watch(modelValue, () => {
    nextTick(resizeTextarea);
  });

  onMounted(() => {
    nextTick(resizeTextarea);
  });

  // Listen for container width changes (window resize, etc.)
  let observer: ResizeObserver | null = null;
  onMounted(() => {
    if (textareaRef.value) {
      observer = new ResizeObserver(() => resizeTextarea());
      observer.observe(textareaRef.value);
    }
  });
  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  return { resizeTextarea };
}
