import { computed, type Ref } from 'vue';

export interface UseWordLimitOptions {
  modelValue: Ref<string | number>;
  maxlength: Ref<number | string | undefined>;
}

export function useWordLimit(options: UseWordLimitOptions) {
  const currentLength = computed(() => {
    const val = options.modelValue.value;
    if (val == null) return 0;
    return String(val).length;
  });

  const maxLength = computed(() => {
    const max = options.maxlength.value;
    if (max == null) return undefined;
    const num = Number(max);
    return Number.isNaN(num) ? undefined : num;
  });

  const isExceed = computed(() => {
    if (maxLength.value == null) return false;
    return currentLength.value > maxLength.value;
  });

  return { currentLength, maxLength, isExceed };
}
