import type { Ref, ComputedRef } from 'vue';

export const selectInjectionKey: unique symbol = Symbol('select');

export interface SelectContext {
  selectValue: ComputedRef<any>;
  visible: Ref<boolean>;
  filteredOptions: ComputedRef<Array<{ value: string | number; label: string; disabled: boolean }>>;
  handleOptionSelect: (option: { value: string | number; label: string; disabled: boolean }) => void;
  hoverIndex: Ref<number>;
  query: Ref<string>;
  multiple: Ref<boolean>;
  remoteLoading: Ref<boolean>;
}
