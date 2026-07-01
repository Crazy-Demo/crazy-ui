/**
 * Common Input Protocol
 *
 * 所有输入组件（Input、Select、DatePicker、InputNumber 等）
 * 必须遵守的统一接口。Form/FormItem 通过此协议与输入组件交互，
 * 不需要知道具体是 Input 还是 Select。
 */

import type { ComponentSize } from './component';

/** 所有输入组件共享的基础 Props（值绑定 + 表单语义） */
export interface InputBaseProps<T = unknown> {
  /** v-model 绑定值 */
  modelValue?: T;
  /** 尺寸 */
  size?: ComponentSize;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 表单 name 属性 */
  name?: string;
}

/** 带交互字段扩展的 Props（清空、状态、占位、图标） */
export interface InputFieldProps<T = unknown> extends InputBaseProps<T> {
  /** 是否可清除 */
  clearable?: boolean;
  /** 输入状态 */
  status?: '' | 'success' | 'error' | 'warning';
  /** 占位文本 */
  placeholder?: string;
  /** 前缀图标 */
  prefixIcon?: string;
  /** 后缀图标 */
  suffixIcon?: string;
}

/** 向后兼容别名 */
export type InputCommonProps<T = unknown> = InputFieldProps<T>;

/** 所有输入组件共享的 Emits 协议 */
export interface InputCommonEmits<T = unknown> {
  (e: 'update:modelValue', value: T): void;
  (e: 'change', value: T): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'clear'): void;
}
