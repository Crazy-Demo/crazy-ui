import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useRovingFocus } from '../src/state/use-roving-focus';

describe('useRovingFocus', () => {
  it('moves to next item on ArrowRight in horizontal mode', () => {
    const items = ref([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    const currentIndex = ref(0);
    const { handleKeydown } = useRovingFocus({ items, currentIndex, orientation: ref('horizontal') });
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(currentIndex.value).toBe(1);
  });

  it('moves to prev item on ArrowLeft', () => {
    const items = ref([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    const currentIndex = ref(1);
    const { handleKeydown } = useRovingFocus({ items, currentIndex, orientation: ref('horizontal') });
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(currentIndex.value).toBe(0);
  });

  it('wraps in loop mode', () => {
    const items = ref([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    const currentIndex = ref(2);
    const { handleKeydown } = useRovingFocus({ items, currentIndex, orientation: ref('horizontal'), loop: ref(true) });
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(currentIndex.value).toBe(0);
  });

  it('skips disabled items', () => {
    const items = ref([{ id: 'a' }, { id: 'b', disabled: true }, { id: 'c' }]);
    const currentIndex = ref(0);
    const { handleKeydown } = useRovingFocus({ items, currentIndex, orientation: ref('horizontal') });
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(currentIndex.value).toBe(2);
  });

  it('Handles Home/End keys', () => {
    const items = ref([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    const currentIndex = ref(0);
    const { handleKeydown } = useRovingFocus({ items, currentIndex });
    handleKeydown(new KeyboardEvent('keydown', { key: 'End' }));
    expect(currentIndex.value).toBe(2);
    handleKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(currentIndex.value).toBe(0);
  });
});
