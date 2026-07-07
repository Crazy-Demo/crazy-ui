/**
 * Form Component Types
 */

import type { PropType } from 'vue';
import type { ComponentSize } from '@crazy-ui/core';

export interface FormRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any, model: Record<string, any>) => boolean | Promise<boolean> | string;
  trigger?: 'change' | 'blur' | 'submit';
}

export type FormRules = Record<string, FormRule[]>;

export interface FormValidateResult {
  [field: string]: { valid: boolean; message: string };
}

export interface FormContext {
  model: Record<string, any>;
  size?: ComponentSize;
  disabled?: boolean;
  rules: FormRules;
  labelWidth?: string;
  labelPosition: 'left' | 'right' | 'top';
  registerField: (prop: string, field: any) => void;
  unregisterField: (prop: string) => void;
  validateField: (prop: string) => Promise<{ valid: boolean; message: string }>;
  validate: () => Promise<boolean>;
  clearValidate: (props?: string[]) => void;
  resetFields: () => void;
}

export const formProps = {
  model: { type: Object as PropType<Record<string, any>>, required: true },
  rules: { type: Object as PropType<FormRules>, default: () => ({}) },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  disabled: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  labelWidth: { type: String, default: undefined },
  labelPosition: { type: String as PropType<'left' | 'right' | 'top'>, default: 'right' },
} as const;

export const formItemProps = {
  label: { type: String, default: undefined },
  prop: { type: String, default: undefined },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  disabled: { type: Boolean, default: false },
} as const;

export const formEmits = {
  submit: (_model: Record<string, any>) => true,
  validate: (_prop: string, _valid: boolean, _message: string) => true,
};
