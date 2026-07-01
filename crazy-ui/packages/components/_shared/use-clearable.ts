import { computed, type Ref } from 'vue';

export interface UseClearableOptions {
  modelValue: Ref<unknown>;
  clearable: Ref<boolean>;
  readonly: Ref<boolean>;
  disabled: Ref<boolean>;
  focused: Ref<boolean>;
  hovering: Ref<boolean>;
}

export function useClearable(options: UseClearableOptions) {
  const showClear = computed(() => {
    return (
      options.clearable.value &&
      !options.disabled.value &&
      !options.readonly.value &&
      options.modelValue.value !== undefined &&
      options.modelValue.value !== null &&
      options.modelValue.value !== '' &&
      (options.focused.value || options.hovering.value)
    );
  });

  return { showClear };
}
