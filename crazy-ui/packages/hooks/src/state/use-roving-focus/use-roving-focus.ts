import { ref, type Ref } from 'vue';

export interface UseRovingFocusOptions {
  items: Ref<Array<{ id: string | number; disabled?: boolean }>>;
  currentIndex: Ref<number>;
  orientation?: Ref<'horizontal' | 'vertical'>;
  loop?: Ref<boolean>;
  dir?: Ref<'ltr' | 'rtl'>;
}

export function useRovingFocus(options: UseRovingFocusOptions) {
  const {
    items,
    orientation = ref('horizontal'),
    loop = ref(true),
    dir = ref('ltr'),
  } = options;

  function findNextEnabled<T extends { disabled?: boolean }>(
    currentIdx: number, allItems: T[], shouldLoop: boolean,
  ): number | undefined {
    const len = allItems.length;
    if (len === 0) return undefined;
    for (let i = 1; i <= len; i++) {
      const idx = (currentIdx + i) % len;
      if (!shouldLoop && currentIdx + i >= len) return undefined;
      if (!allItems[idx].disabled) return idx;
    }
    return undefined;
  }

  function findPrevEnabled<T extends { disabled?: boolean }>(
    currentIdx: number, allItems: T[], shouldLoop: boolean,
  ): number | undefined {
    const len = allItems.length;
    if (len === 0) return undefined;
    for (let i = 1; i <= len; i++) {
      const idx = ((currentIdx - i) % len + len) % len;
      if (!shouldLoop && currentIdx - i < 0) return undefined;
      if (!allItems[idx].disabled) return idx;
    }
    return undefined;
  }

  function handleKeydown(event: KeyboardEvent) {
    const isHorizontal = orientation.value === 'horizontal';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const effectiveNextKey = dir.value === 'rtl' && isHorizontal ? prevKey : nextKey;
    const effectivePrevKey = dir.value === 'rtl' && isHorizontal ? nextKey : prevKey;
    const enabledItems = items.value.filter(item => !item.disabled);
    if (!enabledItems.length) return;

    let newIndex: number | undefined;
    switch (event.key) {
      case effectiveNextKey:
        event.preventDefault();
        newIndex = findNextEnabled(options.currentIndex.value, items.value, loop.value);
        break;
      case effectivePrevKey:
        event.preventDefault();
        newIndex = findPrevEnabled(options.currentIndex.value, items.value, loop.value);
        break;
      case 'Home':
        event.preventDefault();
        newIndex = items.value.findIndex(item => !item.disabled);
        if (newIndex < 0) newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        let last = -1;
        for (let i = items.value.length - 1; i >= 0; i--) {
          if (!items.value[i].disabled) { last = i; break; }
        }
        newIndex = last >= 0 ? last : items.value.length - 1;
        break;
    }
    if (newIndex !== undefined) options.currentIndex.value = newIndex;
  }

  return { handleKeydown };
}
