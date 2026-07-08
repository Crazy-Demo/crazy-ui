import { computed, type Ref } from 'vue';
import type { TableColumn, SortState } from '../types';

export function useColumns(
  columnsRef: Ref<TableColumn[]>,
  sortState: Ref<SortState | null>,
) {
  const flatColumns = computed(() => {
    const result: TableColumn[] = [];
    function flatten(cols: TableColumn[]) {
      for (const col of cols) {
        if (col.children?.length) {
          flatten(col.children);
        } else {
          result.push(col);
        }
      }
    }
    flatten(columnsRef.value);
    return result;
  });

  const columnsWithSort = computed(() =>
    flatColumns.value.map((col) => {
      const key = col.dataIndex ?? col.key ?? '';
      const sortOrder =
        sortState.value?.key === key ? sortState.value.order : null;
      return { ...col, _sortOrder: sortOrder };
    }),
  );

  return { flatColumns, columnsWithSort };
}
