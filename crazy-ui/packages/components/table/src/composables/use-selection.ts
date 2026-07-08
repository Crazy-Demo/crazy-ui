import { ref, computed } from 'vue';
import type { TableRow, TableRowKey, RowSelection } from '../types';

export function useSelection(
  data: () => TableRow[],
  getRowKey: (row: TableRow, index: number) => TableRowKey,
  rowSelection: RowSelection | undefined,
  emit: (event: string, ...args: any[]) => void,
) {
  const innerSelectedKeys = ref<TableRowKey[]>(
    rowSelection?.selectedRowKeys ?? [],
  );

  const selectedRowKeys = computed(() =>
    rowSelection?.selectedRowKeys ?? innerSelectedKeys.value,
  );

  function isRowSelected(key: TableRowKey): boolean {
    return selectedRowKeys.value.includes(key);
  }

  function toggleRowSelection(row: TableRow, key: TableRowKey) {
    const idx = innerSelectedKeys.value.indexOf(key);
    if (idx > -1) {
      innerSelectedKeys.value.splice(idx, 1);
    } else {
      innerSelectedKeys.value.push(key);
    }
    emitSelectionChange();
    emit('select', getSelectedRows(), row);
  }

  function toggleAllSelection() {
    const allKeys = data().map((r, i) => getRowKey(r, i));
    const allSelected = allKeys.every((k) => innerSelectedKeys.value.includes(k));

    if (allSelected) {
      innerSelectedKeys.value = [];
    } else {
      innerSelectedKeys.value = allKeys.filter((k) => {
        const row = data().find((r, i) => getRowKey(r, i) === k);
        const disabled =
          rowSelection?.getCheckboxProps?.(row!)?.disabled ?? false;
        return !disabled;
      });
    }
    emitSelectionChange();
    emit('select-all', getSelectedRows());
  }

  function getSelectedRows(): TableRow[] {
    return data().filter((r, i) =>
      innerSelectedKeys.value.includes(getRowKey(r, i)),
    );
  }

  function emitSelectionChange() {
    emit('selection-change', getSelectedRows());
  }

  const isAllSelected = computed(() => {
    const allKeys = data().map((r, i) => getRowKey(r, i));
    if (allKeys.length === 0) return false;
    const selectableKeys = allKeys.filter((k) => {
      const row = data().find((r, i) => getRowKey(r, i) === k);
      const disabled =
        rowSelection?.getCheckboxProps?.(row!)?.disabled ?? false;
      return !disabled;
    });
    return (
      selectableKeys.length > 0 &&
      selectableKeys.every((k) => innerSelectedKeys.value.includes(k))
    );
  });

  const isIndeterminate = computed(
    () =>
      !isAllSelected.value &&
      innerSelectedKeys.value.length > 0,
  );

  return {
    selectedRowKeys,
    isRowSelected,
    isAllSelected,
    isIndeterminate,
    toggleRowSelection,
    toggleAllSelection,
  };
}
