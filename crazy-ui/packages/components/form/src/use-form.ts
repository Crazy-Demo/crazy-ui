/**
 * Form composable — core validation engine
 */

import { reactive, provide, toRef, type InjectionKey } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { formInjectionKey } from '@crazy-ui/core';
import type { FormRules, FormContext } from './types';

export function useForm(props: Record<string, any>, emit: any) {
  const ns = useNamespace('form');
  // Non-reactive registry: the stored Ref values must NOT be auto-unwrapped
  const fields: Record<string, any> = {};

  function registerField(prop: string, field: any) {
    fields[prop] = field;
  }

  function unregisterField(prop: string) {
    delete fields[prop];
  }

  // Validate a single field
  async function validateField(prop: string): Promise<{ valid: boolean; message: string }> {
    const rules = (props.rules as FormRules)[prop];
    if (!rules || rules.length === 0) return { valid: true, message: '' };

    const value = props.model[prop];

    for (const rule of rules) {
      // Required check
      if (rule.required) {
        const isEmpty =
          value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0);
        if (isEmpty) {
          return { valid: false, message: rule.message || `${prop} is required` };
        }
      }

      // Skip other checks if value is empty and not required
      if (value === undefined || value === null || value === '') continue;

      // Min length
      if (rule.min !== undefined) {
        if (typeof value === 'string' && value.length < rule.min) {
          return { valid: false, message: rule.message || `Minimum ${rule.min} characters` };
        }
        if (typeof value === 'number' && value < rule.min) {
          return { valid: false, message: rule.message || `Minimum value is ${rule.min}` };
        }
      }

      // Max length
      if (rule.max !== undefined) {
        if (typeof value === 'string' && value.length > rule.max) {
          return { valid: false, message: rule.message || `Maximum ${rule.max} characters` };
        }
        if (typeof value === 'number' && value > rule.max) {
          return { valid: false, message: rule.message || `Maximum value is ${rule.max}` };
        }
      }

      // Pattern
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          return { valid: false, message: rule.message || 'Pattern mismatch' };
        }
      }

      // Custom validator
      if (rule.validator) {
        const result = await rule.validator(value, props.model);
        if (result === false) {
          return { valid: false, message: rule.message || 'Validation failed' };
        }
        if (typeof result === 'string') {
          return { valid: false, message: result };
        }
      }
    }

    return { valid: true, message: '' };
  }

  // Validate all fields
  async function validate(): Promise<boolean> {
    let allValid = true;
    for (const prop of Object.keys(props.rules || {})) {
      const result = await validateField(prop);
      const field = fields[prop];
      if (field) {
        field.validateState.value = result.valid ? '' : 'error';
        field.errorMessage.value = result.message;
      }
      if (!result.valid) allValid = false;
    }
    return allValid;
  }

  // Reset validation state
  function clearValidate(props_?: string[]) {
    const targets = props_ || Object.keys(props.rules || {});
    for (const prop of targets) {
      const field = fields[prop];
      if (field) {
        field.validateState.value = '';
        field.errorMessage.value = '';
      }
    }
  }

  // Reset all fields
  function resetFields() {
    clearValidate();
  }

  // Handle submit
  async function handleSubmit(event?: Event) {
    event?.preventDefault();
    const valid = await validate();
    if (valid) {
      emit('submit', { ...props.model });
    }
  }

  const formContext = reactive<FormContext>({
    model: props.model,
    size: toRef(props, 'size') as any,
    disabled: toRef(props, 'disabled') as any,
    rules: props.rules,
    labelWidth: props.labelWidth,
    labelPosition: props.labelPosition,
    registerField,
    unregisterField,
    validateField,
    validate,
    clearValidate,
    resetFields,
  });

  provide(formInjectionKey as unknown as InjectionKey<FormContext>, formContext);

  return {
    ns,
    formContext,
    handleSubmit,
    validate,
    clearValidate,
    resetFields,
  };
}
