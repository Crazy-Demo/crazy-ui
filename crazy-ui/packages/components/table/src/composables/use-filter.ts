import { ref } from 'vue';
import type { TableRow, FilterState, TableColumn } from '../types';

export function useFilter() {
  const filterState = ref<FilterState[]>([]);

  function setFilter(columnKey: string, filteredValues: any[]) {
    const idx = filterState.value.findIndex((f) => f.columnKey === columnKey);
    if (filteredValues.length === 0) {
      if (idx > -1) filterState.value.splice(idx, 1);
    } else {
      if (idx > -1) {
        filterState.value[idx] = { columnKey, filteredValues };
      } else {
        filterState.value.push({ columnKey, filteredValues });
      }
    }
  }

  function filterData(data: TableRow[], columns: TableColumn[]): TableRow[] {
    if (filterState.value.length === 0) return data;
    return data.filter((row) =>
      filterState.value.every((f) => {
        const col = columns.find(
          (c) => (c.dataIndex ?? c.key) === f.columnKey,
        );
        if (col?.filterMethod) {
          return f.filteredValues.some((v) =>
            col.filterMethod!(v, row, col),
          );
        }
        const val = row[f.columnKey];
        return f.filteredValues.some((v) => v === val);
      }),
    );
  }

  return { filterState, setFilter, filterData };
}
