import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useSize } from '../src/context/use-size';

describe('useSize', () => {
  it('returns default medium when no inject', () => {
    const size = useSize();
    expect(size.value).toBe('medium');
  });

  it('returns fallback when no inject', () => {
    const size = useSize(ref('small'));
    expect(size.value).toBe('small');
  });

  it('returns static fallback', () => {
    const size = useSize('large');
    expect(size.value).toBe('large');
  });
});
