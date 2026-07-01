import { describe, it, expect } from 'vitest';
import { useZIndex } from '../src/context/use-z-index';

describe('useZIndex', () => {
  it('returns initial zIndex of 2000 when no ConfigProvider', () => {
    const { currentZIndex, nextZIndex } = useZIndex();
    expect(currentZIndex.value).toBe(2000);
  });

  it('nextZIndex increments and returns new value', () => {
    const { nextZIndex } = useZIndex();
    const z1 = nextZIndex();
    const z2 = nextZIndex();
    expect(z1).toBe(2001);
    expect(z2).toBe(2002);
  });

  it('accepts custom initialZIndex', () => {
    const { currentZIndex } = useZIndex(3000);
    expect(currentZIndex.value).toBe(3000);
  });

  it('currentZIndex reflects latest value after increments', () => {
    const { currentZIndex, nextZIndex } = useZIndex();
    nextZIndex();
    nextZIndex();
    expect(currentZIndex.value).toBe(2002);
  });
});
