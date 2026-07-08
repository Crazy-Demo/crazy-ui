import { ref } from 'vue';
import type { TableRowKey } from '../types';

export function useExpand() {
  const expandedRowKeys = ref<TableRowKey[]>([]);

  function toggleExpand(key: TableRowKey) {
    const idx = expandedRowKeys.value.indexOf(key);
    if (idx > -1) {
      expandedRowKeys.value.splice(idx, 1);
    } else {
      expandedRowKeys.value.push(key);
    }
  }

  return { expandedRowKeys, toggleExpand };
}
