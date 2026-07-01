import { computed, onMounted, onBeforeUnmount, toRef, type Ref } from 'vue';
import { useFormItem, useId } from '@crazy-ui/hooks';
import type { ComponentSize } from '@crazy-ui/core';

export interface UseInputCommonProps {
  size?: ComponentSize;
  disabled?: boolean;
  status?: '' | 'success' | 'error' | 'warning';
}

export function useInputCommon(props: UseInputCommonProps) {
  const { size, disabled, validateState, formItem } = useFormItem({
    size: toRef(props, 'size'),
    disabled: toRef(props, 'disabled'),
  });

  const inputId = useId();

  const statusClass = computed(() => {
    const state = validateState.value;
    if (state === 'error' || props.status === 'error') return 'is-error';
    if (state === 'success' || props.status === 'success') return 'is-success';
    if (state === 'warning' || props.status === 'warning') return 'is-warning';
    if (state === 'validating') return 'is-validating';
    return '';
  });

  onMounted(() => {
    formItem?.addInputId(inputId.id.value);
  });

  onBeforeUnmount(() => {
    formItem?.removeInputId(inputId.id.value);
  });

  return {
    _size: size,
    _disabled: disabled,
    validateState,
    formItem,
    inputId,
    statusClass,
  };
}
