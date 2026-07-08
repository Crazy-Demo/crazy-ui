import { ref } from 'vue';
import type { SortState, SortOrder, TableRow } from '../types';

export function useSorter(
  defaultSort: SortState | undefined,
  emit: (event: string, ...args: any[]) => void,
) {
  const sortState = ref<SortState | null>(defaultSort ?? null);

  const nextOrderMap: Record<string, SortOrder | null> = {
    ascend: 'descend',
    descend: null,
    null: 'ascend',
  };

  function toggleSort(key: string) {
    const current = sortState.value;
    if (!current || current.key !== key) {
      sortState.value = { key, order: 'ascend' };
    } else {
      const currentOrder = current.order ?? 'null';
      const newOrder = nextOrderMap[currentOrder];
      sortState.value = newOrder ? { key, order: newOrder } : null;
    }
    emit('sort-change', sortState.value);
  }

  function sortData(data: TableRow[], sortKey: string | null) {
    if (!sortKey || !sortState.value) return data;
    const { order } = sortState.value;
    if (!order) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const result =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
      return order === 'descend' ? -result : result;
    });
  }

  return { sortState, toggleSort, sortData };
}
