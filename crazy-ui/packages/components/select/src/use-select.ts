import { ref, computed, watch, toRef } from 'vue';
import { useFormItem, useId, useNamespace } from '@crazy-ui/hooks';
import type { SelectOption } from './types';

export function useSelect(props: Record<string, any>, emit: any) {
  const ns = useNamespace('select');
  const { id: inputId } = useId({ prefix: 'crazy-select' });

  const { formItem, size: _size, disabled: _disabled, validateState } = useFormItem({
    size: toRef(props, 'size'),
    disabled: toRef(props, 'disabled'),
  });

  const statusClass = computed(() => {
    if (!validateState.value) return '';
    return `is-${validateState.value}`;
  });

  const visible = ref(false);
  const query = ref('');
  const hoverIndex = ref(-1);
  const remoteLoading = ref(false);

  // Internal option registry
  const optionStates = ref<Map<string | number, SelectOption>>(new Map());

  function registerOption(option: SelectOption) {
    optionStates.value.set(option.value, option);
  }

  function unregisterOption(value: string | number) {
    optionStates.value.delete(value);
  }

  // All options as flat array
  const allOptions = computed(() => Array.from(optionStates.value.values()));

  // Filtered by query
  const filteredOptions = computed(() => {
    if (!query.value) return allOptions.value.filter(o => !o.disabled);
    const q = query.value.toLowerCase();
    return allOptions.value.filter(o =>
      !o.disabled && o.label.toLowerCase().includes(q)
    );
  });

  // Selected label(s)
  const selectedLabel = computed(() => {
    if (props.multiple) {
      const values = (props.modelValue as any[]) || [];
      if (values.length === 0) return '';
      return values.map((v: any) => findLabel(v)).join(', ');
    }
    return findLabel(props.modelValue);
  });

  function findLabel(value: any): string {
    for (const [, opt] of optionStates.value) {
      if (opt.value === value) return opt.label;
    }
    return String(value ?? '');
  }

  function openDropdown() {
    if (_disabled.value) return;
    visible.value = true;
    query.value = '';
    hoverIndex.value = -1;
    emit('visible-change', true);
  }

  function toggleDropdown() {
    if (_disabled.value) return;
    if (visible.value) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function closeDropdown() {
    visible.value = false;
    query.value = '';
    hoverIndex.value = -1;
    emit('visible-change', false);
  }

  function handleOptionSelect(option: SelectOption) {
    if (option.disabled) return;

    if (props.multiple) {
      const current: any[] = [...(props.modelValue || [])];
      const idx = current.indexOf(option.value);
      if (idx > -1) {
        current.splice(idx, 1);
      } else {
        current.push(option.value);
      }
      emit('update:modelValue', current);
      emit('change', current);
    } else {
      emit('update:modelValue', option.value);
      emit('change', option.value);
      closeDropdown();
    }
    formItem?.validate('change');
  }

  function onClear() {
    const value = props.multiple ? [] : undefined;
    emit('update:modelValue', value);
    emit('change', value);
    emit('clear');
    closeDropdown();
  }

  // Keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (!visible.value) {
      if (event.key === 'Enter' || event.key === 'ArrowDown') {
        event.preventDefault();
        openDropdown();
      }
      return;
    }

    const opts = filteredOptions.value;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        hoverIndex.value = Math.min(hoverIndex.value + 1, opts.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        hoverIndex.value = Math.max(hoverIndex.value - 1, 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (hoverIndex.value >= 0 && opts[hoverIndex.value]) {
          handleOptionSelect(opts[hoverIndex.value]);
        }
        break;
      case 'Escape':
        closeDropdown();
        break;
    }
  }

  // Allow create
  const showCreate = computed(() =>
    props.allowCreate && props.filterable && query.value && !hasExactMatch.value
  );

  const hasExactMatch = computed(() =>
    allOptions.value.some(o => o.label === query.value)
  );

  function handleCreate() {
    if (!showCreate.value) return;
    const newValue = query.value;
    const newOption: SelectOption = { value: newValue, label: newValue };
    registerOption(newOption);
    handleOptionSelect(newOption);
  }

  // Remote search with debounce
  let remoteTimer: ReturnType<typeof setTimeout> | null = null;
  watch(query, (q) => {
    if (!props.remote || !props.remoteMethod) return;
    if (remoteTimer) clearTimeout(remoteTimer);
    remoteTimer = setTimeout(async () => {
      remoteLoading.value = true;
      try { await props.remoteMethod(q); }
      finally { remoteLoading.value = false; }
    }, 300);
  });

  // Sync options prop to registry
  watch(() => props.options, (opts: SelectOption[] | undefined) => {
    if (!opts) return;
    optionStates.value.clear();
    for (const opt of opts) {
      optionStates.value.set(opt.value, { value: opt.value, label: opt.label, disabled: opt.disabled ?? false });
    }
  }, { immediate: true, deep: true });

  return {
    ns, _size, _disabled, validateState, formItem, inputId, statusClass,
    visible, query, hoverIndex, remoteLoading,
    allOptions, filteredOptions, selectedLabel, showCreate, hasExactMatch,
    openDropdown, toggleDropdown, closeDropdown, handleOptionSelect, onClear,
    handleKeydown, handleCreate,
    registerOption, unregisterOption, findLabel,
  };
}
