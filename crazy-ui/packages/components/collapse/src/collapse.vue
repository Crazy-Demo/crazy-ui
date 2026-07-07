<template>
  <div :class="ns.b()"><slot /></div>
</template>

<script setup lang="ts">
import { provide, toRef } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { collapseProps } from './types';

const props = defineProps(collapseProps);
const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]];
  change: [value: (string | number)[]];
}>();

const ns = useNamespace('collapse');

function toggle(name: string | number) {
  if (props.accordion) {
    const isActive = (props.modelValue || []).includes(name);
    if (isActive) {
      emit('update:modelValue', []);
      emit('change', []);
    } else {
      emit('update:modelValue', [name]);
      emit('change', [name]);
    }
  } else {
    const values = [...(props.modelValue || [])];
    const idx = values.indexOf(name);
    if (idx > -1) {
      values.splice(idx, 1);
    } else {
      values.push(name);
    }
    emit('update:modelValue', values);
    emit('change', values);
  }
}

provide('collapseContext', {
  activeNames: toRef(props, 'modelValue'),
  accordion: toRef(props, 'accordion'),
  toggle,
});
</script>
