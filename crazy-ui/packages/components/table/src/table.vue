<template>
  <div :class="[ns.b(), ns.m(_size), { 'is-bordered': bordered, 'is-stripe': stripe }]">
    <!-- Loading overlay -->
    <div v-if="loading" :class="ns.e('loading')">
      <div :class="ns.e('spinner')">
        <svg viewBox="25 25 50 50"><circle cx="50" cy="50" r="20" fill="none" /></svg>
      </div>
    </div>

    <div
      :class="[ns.e('wrapper')]"
      :style="{ maxHeight: maxHeightStr, height: heightStr }"
    >
      <table :class="ns.e('table')">
        <!-- Header -->
        <thead v-if="showHeader" :class="ns.e('header')">
          <tr>
            <!-- Selection column -->
            <th v-if="hasSelection" :class="[ns.e('cell'), ns.em('cell', 'header'), ns.em('cell', 'selection')]" :style="{ width: '48px' }">
              <span :class="ns.e('checkbox')">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isIndeterminate"
                  @change="handleSelectAll"
                />
              </span>
            </th>
            <!-- Index column -->
            <th v-if="hasIndex" :class="[ns.e('cell'), ns.em('cell', 'header')]">#</th>
            <!-- Data columns -->
            <th
              v-for="col in displayColumns"
              :key="col.dataIndex ?? col.key"
              :class="[ns.e('cell'), ns.em('cell', 'header'), {
                'is-sortable': col.sortable,
                'is-align-left': col.align === 'left',
                'is-align-center': col.align === 'center',
                'is-align-right': col.align === 'right',
              }]"
              :style="colStyle(col)"
              @click="col.sortable && handleSort(col)"
            >
              <span :class="ns.e('header-text')">{{ col.title }}</span>
              <span v-if="col.sortable" :class="ns.e('sort-icon')">
                <span v-if="col._sortOrder === 'ascend'">&#9650;</span>
                <span v-else-if="col._sortOrder === 'descend'">&#9660;</span>
                <span v-else :class="ns.e('sort-icon--inactive')">&#9650;</span>
              </span>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody :class="ns.e('body')">
          <tr
            v-for="(row, rowIdx) in processedData"
            :key="getRowKey(row, rowIdx)"
            :class="[ns.e('row'), {
              'is-stripe': stripe && rowIdx % 2 === 1,
              'is-current': highlightCurrentRow && currentRow === row,
            }]"
            @click="handleRowClick(row, rowIdx, $event)"
            @dblclick="handleRowDblclick(row, rowIdx, $event)"
          >
            <!-- Selection checkbox -->
            <td v-if="hasSelection" :class="[ns.e('cell'), ns.em('cell', 'selection')]">
              <input
                type="checkbox"
                :checked="isRowSelectedByRow(row, rowIdx)"
                :disabled="isRowDisabled(row)"
                @change="handleRowSelect(row, rowIdx)"
              />
            </td>
            <!-- Index -->
            <td v-if="hasIndex" :class="ns.e('cell')">{{ rowIdx + 1 }}</td>
            <!-- Data cells -->
            <td
              v-for="col in displayColumns"
              :key="col.dataIndex ?? col.key"
              :class="[ns.e('cell'), {
                'is-align-left': col.align === 'left',
                'is-align-center': col.align === 'center',
                'is-align-right': col.align === 'right',
              }]"
              :style="colStyle(col)"
            >
              <slot
                :name="col.dataIndex ?? col.key"
                :row="row"
                :column="col"
                :index="rowIdx"
                :value="getCellValue(row, col)"
              >
                {{ formatCellValue(row, col, rowIdx) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div v-if="processedData.length === 0 && !loading" :class="ns.e('empty')">
        <slot name="empty">
          <span>{{ emptyTextStr }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, toRef } from 'vue';
import { useNamespace, useSize } from '@crazy-ui/hooks';
import { tableProps, tableEmits, tableInjectionKey } from './types';
import { useColumns } from './composables/use-columns';
import { useSorter } from './composables/use-sorter';
import { useSelection } from './composables/use-selection';

import type { TableRow, TableColumn, TableRowKey, TableContext } from './types';

const props = defineProps(tableProps);
const emit = defineEmits(tableEmits);
const ns = useNamespace('table');
const size = useSize();

const currentRow = ref<TableRow | null>(null);

// ---------- Size ----------
const _size = computed(() => props.size ?? size.value ?? 'medium');

// ---------- Columns ----------
const { flatColumns, columnsWithSort } = useColumns(
  toRef(props, 'columns') as any,
  ref(null) as any,
);

const displayColumns = computed(() => {
  // Check if columns array is provided, otherwise derive from first data row
  const cols = props.columns.length > 0
    ? props.columns
    : Object.keys(props.data?.[0] ?? {}).map((k) => ({
        dataIndex: k,
        title: k,
        key: k,
      }));
  return cols.filter((c) => {
    if (c.children) return false;
    return true;
  });
});

const hasSelection = computed(
  () => props.rowSelection?.type === 'checkbox',
);

const hasIndex = computed(() =>
  displayColumns.value.some((c) => c.type === 'index' as any),
);

// ---------- Sorter ----------
const sorter = useSorter(props.defaultSort, emit);

const { sortState, toggleSort: rawToggle, sortData } = sorter;

function handleSort(col: TableColumn) {
  const key = col.dataIndex ?? col.key ?? '';
  rawToggle(key);
}

// ---------- Row key ----------
function getRowKey(row: TableRow, index: number): TableRowKey {
  if (typeof props.rowKey === 'function') return props.rowKey(row);
  return row[props.rowKey] ?? index;
}

// ---------- Data ----------
const processedData = computed(() => {
  let rows = props.data ?? [];

  if (sortState.value) {
    rows = sortData(rows, sortState.value.key);
  }

  return rows;
});

// ---------- Selection ----------
const selection = useSelection(
  () => processedData.value,
  getRowKey,
  props.rowSelection,
  emit,
);

const {
  selectedRowKeys,
  isRowSelected,
  isAllSelected,
  isIndeterminate,
  toggleRowSelection,
  toggleAllSelection,
} = selection;

function isRowSelectedByRow(row: TableRow, idx: number): boolean {
  return isRowSelected(getRowKey(row, idx));
}

function isRowDisabled(row: TableRow): boolean {
  return props.rowSelection?.getCheckboxProps?.(row)?.disabled ?? false;
}

function handleRowSelect(row: TableRow, idx: number) {
  toggleRowSelection(row, getRowKey(row, idx));
}

function handleSelectAll() {
  toggleAllSelection();
}

// ---------- Cell value ----------
function getCellValue(row: TableRow, col: TableColumn): any {
  const key = col.dataIndex ?? col.key ?? '';
  return row[key];
}

function formatCellValue(row: TableRow, col: TableColumn, rowIdx: number): string {
  const val = getCellValue(row, col);
  if (col.formatter) {
    return col.formatter(row, col, val, rowIdx);
  }
  return val == null ? '' : String(val);
}

// ---------- Row events ----------
function handleRowClick(row: TableRow, rowIdx: number, event: MouseEvent) {
  if (props.highlightCurrentRow) currentRow.value = row;
  const col = displayColumns.value[0];
  emit('row-click', row, col, event);
}

function handleRowDblclick(row: TableRow, rowIdx: number, event: MouseEvent) {
  const col = displayColumns.value[0];
  emit('row-dblclick', row, col, event);
}

// ---------- Styles ----------
const heightStr = computed(() =>
  props.height != null
    ? typeof props.height === 'number'
      ? `${props.height}px`
      : props.height
    : undefined,
);

const maxHeightStr = computed(() =>
  props.maxHeight != null
    ? typeof props.maxHeight === 'number'
      ? `${props.maxHeight}px`
      : props.maxHeight
    : undefined,
);

function colStyle(col: TableColumn): Record<string, string> {
  const s: Record<string, string> = {};
  if (col.width) {
    s.width = typeof col.width === 'number' ? `${col.width}px` : col.width;
  }
  if (col.minWidth) {
    s.minWidth =
      typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth;
  }
  return s;
}

const emptyTextStr = computed(() => props.emptyText ?? '暂无数据');

// ---------- Context provide ----------
provide<TableContext>(tableInjectionKey, {
  props,
  columns: displayColumns as any,
  data: processedData as any,
  getRowKey,
  sortState,
  toggleSort: rawToggle,
  selectedRowKeys,
  isRowSelected,
  toggleRowSelection,
  toggleAllSelection,
} as TableContext);
</script>
