<template>
  <span
    :class="[
      ns.b(),
      ns.m(type),
      ns.m(size),
      ns.m(effect),
      { 'is-round': round },
    ]"
    :style="colorStyle"
    @click="emit('click', $event)"
  >
    <slot />
    <span
      v-if="closable"
      :class="ns.e('close')"
      @click.stop="emit('close', $event)"
    >&#x2715;</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { tagProps, tagEmits } from './types';

const props = defineProps(tagProps);
const emit = defineEmits(tagEmits);
const ns = useNamespace('tag');

const colorStyle = computed(() => {
  if (!props.color) return {};
  if (props.effect === 'light') {
    return {
      backgroundColor: props.color + '1a',
      color: props.color,
      borderColor: props.color + '33',
    };
  }
  return {
    backgroundColor: props.color,
    borderColor: props.color,
    color: '#fff',
  };
});
</script>
