import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { useControllable } from '../src/state/use-controllable';

describe('useControllable', () => {
  it('uses defaultValue in uncontrolled mode', () => {
    const value = ref<string | number | undefined>(undefined);
    const defaultValue = ref<string | number | undefined>('home');
    const onChange = vi.fn();
    const active = useControllable({ value, defaultValue, onChange, fallback: '' });
    expect(active.value).toBe('home');
  });

  it('uses value in controlled mode', () => {
    const value = ref<string | number | undefined>('settings');
    const defaultValue = ref<string | number | undefined>('home');
    const onChange = vi.fn();
    const active = useControllable({ value, defaultValue, onChange, fallback: '' });
    expect(active.value).toBe('settings');
  });

  it('falls back to fallback when no value or defaultValue', () => {
    const value = ref<string | number | undefined>(undefined);
    const defaultValue = ref<string | number | undefined>(undefined);
    const onChange = vi.fn();
    const active = useControllable({ value, defaultValue, onChange, fallback: '' });
    expect(active.value).toBe('');
  });

  it('emits onChange on write in controlled mode', () => {
    const value = ref<string | number | undefined>('home');
    const defaultValue = ref<string | number | undefined>(undefined);
    const onChange = vi.fn();
    const active = useControllable({ value, defaultValue, onChange, fallback: '' });
    active.value = 'settings';
    expect(onChange).toHaveBeenCalledWith('settings');
  });

  it('updates internal state and emits onChange in uncontrolled mode', () => {
    const value = ref<string | number | undefined>(undefined);
    const defaultValue = ref<string | number | undefined>('home');
    const onChange = vi.fn();
    const active = useControllable({ value, defaultValue, onChange, fallback: '' });
    active.value = 'settings';
    expect(onChange).toHaveBeenCalledWith('settings');
    expect(active.value).toBe('settings');
  });
});
