import { ref, computed, type Ref, type WritableComputedRef } from 'vue';

export interface UseControllableOptions<T> {
  value: Ref<T | undefined>;
  defaultValue: Ref<T | undefined>;
  onChange: (value: T) => void;
  fallback: T;
}

export function useControllable<T>(options: UseControllableOptions<T>): WritableComputedRef<T> {
  const { value, defaultValue, onChange, fallback } = options;

  const internalValue = ref<T>(defaultValue.value ?? fallback) as Ref<T>;
  const isControlled = () => value.value !== undefined;

  return computed({
    get() {
      if (isControlled()) return value.value as T;
      return internalValue.value;
    },
    set(newValue: T) {
      if (isControlled()) {
        onChange(newValue);
      } else {
        internalValue.value = newValue;
        onChange(newValue);
      }
    },
  });
}
