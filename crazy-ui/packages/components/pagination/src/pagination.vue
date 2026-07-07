<template>
  <div :class="[ns.b(), ns.m(size)]">
    <button
      :class="[ns.e('btn'), { 'is-disabled': currentPage <= 1 }]"
      :disabled="disabled || currentPage <= 1"
      @click="goTo(currentPage - 1)"
    >
      ‹
    </button>
    <button
      v-for="p in pages"
      :key="p"
      :class="[
        ns.e('btn'),
        { 'is-active': p === currentPage, 'is-ellipsis': p === '...' },
      ]"
      :disabled="disabled || p === '...'"
      @click="p !== '...' && goTo(p as number)"
    >
      {{ p }}
    </button>
    <button
      :class="[ns.e('btn'), { 'is-disabled': currentPage >= totalPages }]"
      :disabled="disabled || currentPage >= totalPages"
      @click="goTo(currentPage + 1)"
    >
      ›
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { paginationProps } from './types';

const props = defineProps(paginationProps);
const emit = defineEmits<{
  'update:currentPage': [page: number];
  change: [page: number];
}>();
const ns = useNamespace('pagination');

const totalPages = computed(() => Math.ceil(props.total / props.pageSize));

const pages = computed(() => {
  const pgs: (number | string)[] = [];
  const total = totalPages.value;
  const cur = props.currentPage;
  const count = props.pagerCount;

  if (total <= count) {
    for (let i = 1; i <= total; i++) pgs.push(i);
  } else {
    // Always show first page
    pgs.push(1);

    // Calculate start and end of middle range
    const start = Math.max(2, cur - Math.floor((count - 4) / 2));
    const end = Math.min(total - 1, start + count - 5);

    // Add ellipsis before middle range if needed
    if (start > 2) pgs.push('...');

    // Add middle page numbers
    for (let i = Math.max(2, start); i <= Math.min(total - 1, end); i++) {
      pgs.push(i);
    }

    // Add ellipsis after middle range if needed
    if (end < total - 1) pgs.push('...');

    // Always show last page
    pgs.push(total);
  }

  return pgs;
});

function goTo(page: number) {
  if (page < 1 || page > totalPages.value || props.disabled) return;
  emit('update:currentPage', page);
  emit('change', page);
}
</script>
