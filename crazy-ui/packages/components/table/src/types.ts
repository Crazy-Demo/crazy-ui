/**
 * Table Types
 */

import type { PropType, InjectionKey, ComputedRef, Ref } from 'vue';
import type { ComponentSize } from '@crazy-ui/core';

// ============ Column ============

export interface TableColumn<T = any> {
  key?: string;
  title?: string;
  dataIndex?: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: boolean | 'left' | 'right';
  sortable?: boolean;
  sortMethod?: (a: T, b: T) => boolean;
  filterable?: boolean;
  filters?: { text: string; value: any }[];
  filterMethod?: (value: any, row: T, column: TableColumn<T>) => boolean;
  formatter?: (row: T, column: TableColumn<T>, cellValue: any, index: number) => string;
  showOverflowTooltip?: boolean;
  children?: TableColumn<T>[];
  className?: string;
}

export type TableRow = Record<string, any>;
export type TableRowKey = string | number;

// ============ Sort ============

export type SortOrder = 'ascend' | 'descend' | null;

export interface SortState {
  key: string;
  order: SortOrder;
}

// ============ Selection ============

export interface RowSelection {
  type?: 'checkbox';
  selectedRowKeys?: TableRowKey[];
  onSelect?: (record: any, selected: boolean, selectedRows: any[]) => void;
  onSelectAll?: (selected: boolean, selectedRows: any[]) => void;
  onChange?: (selectedRowKeys: TableRowKey[], selectedRows: any[]) => void;
  getCheckboxProps?: (record: any) => { disabled?: boolean };
}

// ============ Filter ============

export interface FilterState {
  columnKey: string;
  filteredValues: any[];
}

// ============ Props ============

export const tableProps = {
  data: { type: Array as PropType<any[]>, default: () => [] },
  columns: { type: Array as PropType<TableColumn[]>, default: () => [] },
  rowKey: {
    type: [String, Function] as PropType<string | ((row: any) => TableRowKey)>,
    default: 'id',
  },
  loading: { type: Boolean, default: false },
  bordered: { type: Boolean, default: false },
  stripe: { type: Boolean, default: false },
  size: {
    type: String as PropType<ComponentSize>,
    default: 'medium',
  },
  emptyText: { type: String, default: undefined },
  height: { type: [String, Number] as PropType<string | number>, default: undefined },
  maxHeight: { type: [String, Number] as PropType<string | number>, default: undefined },
  showHeader: { type: Boolean, default: true },
  highlightCurrentRow: { type: Boolean, default: false },
  defaultSort: {
    type: Object as PropType<SortState>,
    default: undefined,
  },
  rowSelection: {
    type: Object as PropType<RowSelection>,
    default: undefined,
  },
} as const;

export const tableEmits = {
  'row-click': (_row: any, _column: TableColumn, _event: MouseEvent) => true,
  'row-dblclick': (_row: any, _column: TableColumn, _event: MouseEvent) => true,
  'sort-change': (_sort: SortState) => true,
  'selection-change': (_selection: any[]) => true,
  'select': (_selection: any[], _row: any) => true,
  'select-all': (_selection: any[]) => true,
};

export type TableProps = {
  data?: any[];
  columns?: TableColumn[];
  rowKey?: string | ((row: any) => TableRowKey);
  loading?: boolean;
  bordered?: boolean;
  stripe?: boolean;
  size?: ComponentSize;
  emptyText?: string;
  height?: string | number;
  maxHeight?: string | number;
  showHeader?: boolean;
  highlightCurrentRow?: boolean;
  defaultSort?: SortState;
  rowSelection?: RowSelection;
};

// ============ Context ============

export interface TableContext<T = any> {
  props: TableProps;
  columns: ComputedRef<TableColumn<T>[]>;
  data: ComputedRef<T[]>;
  getRowKey: (row: T, index: number) => TableRowKey;
  sortState: Ref<SortState | null>;
  toggleSort: (key: string) => void;
  selectedRowKeys: ComputedRef<TableRowKey[]>;
  isRowSelected: (key: TableRowKey) => boolean;
  toggleRowSelection: (row: T, key: TableRowKey) => void;
  toggleAllSelection: () => void;
}

export const tableInjectionKey: InjectionKey<TableContext> = Symbol('tableContext');
