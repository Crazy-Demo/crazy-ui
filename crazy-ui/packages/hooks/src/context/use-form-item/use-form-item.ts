import { inject, computed, unref, type InjectionKey, type Ref } from 'vue';
import {
  formInjectionKey,
  formItemInjectionKey,
  type ComponentSize,
} from '@crazy-ui/core';

export interface FormContext {
  size?: ComponentSize;
  disabled?: boolean;
}

export interface FormItemContext {
  size?: ComponentSize;
  disabled?: boolean;
  validateState: '' | 'success' | 'error' | 'warning' | 'validating';
  validate: (trigger: 'change' | 'blur') => void;
  addInputId: (id: string) => void;
  removeInputId: (id: string) => void;
}

export interface UseFormItemReturn {
  form: FormContext | undefined;
  formItem: FormItemContext | undefined;
  size: Ref<ComponentSize>;
  disabled: Ref<boolean>;
  validateState: Ref<string | undefined>;
}

export function useFormItem(props?: {
  size?: Ref<ComponentSize | undefined>;
  disabled?: Ref<boolean | undefined>;
}): UseFormItemReturn {
  const form = inject(
    formInjectionKey as unknown as InjectionKey<FormContext>,
    undefined,
  );
  const formItem = inject(
    formItemInjectionKey as unknown as InjectionKey<FormItemContext>,
    undefined,
  );

  const size = computed(() => {
    return (
      (props ? unref(props.size) : undefined) ??
      formItem?.size ??
      form?.size ??
      'medium'
    );
  });

  const disabled = computed(() => {
    return (
      (props ? unref(props.disabled) : undefined) ??
      formItem?.disabled ??
      form?.disabled ??
      false
    );
  });

  const validateState = computed(() => formItem?.validateState);

  return { form, formItem, size, disabled, validateState };
}
