<template>
  <div
    ref="selectRef"
    :class="[
      ns.b(),
      ns.m(_size),
      statusClass,
      {
        'is-disabled': _disabled,
        'is-focus': visible,
      },
    ]"
    tabindex="0"
    @click="toggleDropdown"
    @keydown="handleKeydown"
  >
    <!-- Trigger: show tags for multiple, or selected text -->
    <div v-if="multiple && selectedValues.length > 0" :class="ns.e('tags')">
      <span v-for="(val, idx) in visibleTags" :key="val" :class="ns.e('tag')">
        {{ findLabel(val) }}
        <span
          v-if="!disabled"
          :class="ns.e('tag-close')"
          @click.stop="removeTag(val)"
        >✕</span>
      </span>
      <span v-if="collapsedCount > 0" :class="ns.e('tag-more')">+{{ collapsedCount }}</span>
    </div>
    <span v-else-if="!selectedLabel" :class="ns.e('placeholder')">{{ placeholder }}</span>
    <span v-else :class="ns.e('selected')">{{ selectedLabel }}</span>

    <!-- Search input (visible when filterable + dropdown open) -->
    <input
      v-if="filterable && visible"
      ref="searchRef"
      v-model="query"
      :class="ns.e('search-input')"
      :placeholder="selectedLabel || placeholder"
      @click.stop
      @keydown="handleKeydown"
      @focus="openDropdown"
    />

    <!-- Suffix -->
    <span :class="ns.e('suffix')">
      <span
        v-if="clearable && hasValue"
        :class="ns.e('clear')"
        @click.stop="onClear"
      >✕</span>
      <span :class="[ns.e('arrow'), { 'is-reverse': visible }]"></span>
    </span>

    <!-- Dropdown (absolute positioned) -->
    <div
      v-show="visible"
      ref="dropdownRef"
      :class="ns.e('dropdown')"
      :style="{ maxHeight: popperMaxHeight + 'px' }"
    >
      <div v-if="loading || remoteLoading" :class="ns.e('dropdown-loading')">Loading...</div>
      <div
        v-else-if="filteredOptions.length === 0 && !showCreate"
        :class="ns.e('dropdown-empty')"
      >No data</div>
      <template v-else>
        <div
          v-for="(opt, idx) in filteredOptions"
          :key="opt.value"
          :class="[
            ns.e('option'),
            {
              'is-hover': idx === hoverIndex,
              'is-disabled': opt.disabled,
              'is-selected': isSelected(opt.value),
            },
          ]"
          @click.stop="handleOptionSelect(opt)"
          @mouseenter="hoverIndex = idx"
        >
          <span v-if="multiple" :class="[ns.e('check'), { 'is-checked': isSelected(opt.value) }]">✓</span>
          {{ opt.label }}
        </div>
        <div
          v-if="showCreate"
          :class="ns.e('option')"
          @click.stop="handleCreate"
        >
          Create "{{ query }}"
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useClickOutside } from '@crazy-ui/hooks';
import { useSelect } from './use-select';
import { selectProps, selectEmits } from './types';

const props = defineProps(selectProps);
const emit = defineEmits(selectEmits);

const {
  ns, _size, _disabled, statusClass,
  visible, query, hoverIndex, remoteLoading,
  filteredOptions, selectedLabel, showCreate,
  openDropdown, toggleDropdown, closeDropdown, handleOptionSelect, onClear,
  handleKeydown, handleCreate, findLabel,
} = useSelect(props, emit);

const selectRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const searchRef = ref<HTMLInputElement>();

const hasValue = computed(() => {
  const v = props.modelValue;
  if (props.multiple) return Array.isArray(v) && v.length > 0;
  return v !== undefined && v !== null && v !== '';
});

// Multi-select helpers
const selectedValues = computed(() => {
  if (!props.multiple) return [];
  const v = props.modelValue;
  return Array.isArray(v) ? v : [];
});

const visibleTags = computed(() => {
  const vals = selectedValues.value;
  if (!props.collapseTags || vals.length <= props.maxCollapseTags) return vals;
  return vals.slice(0, props.maxCollapseTags);
});

const collapsedCount = computed(() => {
  if (!props.collapseTags) return 0;
  return Math.max(0, selectedValues.value.length - props.maxCollapseTags);
});

function isSelected(val: any): boolean {
  if (props.multiple) {
    const vals = props.modelValue;
    return Array.isArray(vals) && vals.includes(val);
  }
  return props.modelValue === val;
}

function removeTag(val: string | number) {
  if (!props.multiple) return;
  const current = props.modelValue ? [...props.modelValue] : [];
  const idx = current.indexOf(val);
  if (idx > -1) {
    current.splice(idx, 1);
    emit('update:modelValue', current);
    emit('change', current);
    emit('remove-tag', val);
  }
}

useClickOutside({
  target: dropdownRef,
  exclude: selectRef,
  handler: () => {
    if (visible.value) closeDropdown();
  },
});

// Auto-focus search input when visible
watch(visible, async (v) => {
  if (v && props.filterable) {
    await nextTick();
    searchRef.value?.focus();
  }
});
</script>
