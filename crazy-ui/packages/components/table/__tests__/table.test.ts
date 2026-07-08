import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Table from '../src/table.vue';

const testData = [
  { id: 1, name: 'Alice', age: 28 },
  { id: 2, name: 'Bob', age: 35 },
  { id: 3, name: 'Charlie', age: 42 },
];

const testColumns = [
  { dataIndex: 'name', title: 'Name', key: 'name' },
  { dataIndex: 'age', title: 'Age', key: 'age', sortable: true },
];

function createTable(props = {}) {
  return mount(Table, {
    props: {
      data: testData,
      columns: testColumns,
      ...props,
    },
  });
}

describe('Table', () => {
  // 1. Basic rendering
  it('renders table structure', () => {
    const wrapper = createTable();
    expect(wrapper.find('.crazy-table').exists()).toBe(true);
    expect(wrapper.find('.crazy-table__table').exists()).toBe(true);
  });

  it('renders header columns', () => {
    const wrapper = createTable();
    const headers = wrapper.findAll('.crazy-table__cell--header');
    expect(headers).toHaveLength(2);
    expect(headers[0].text()).toContain('Name');
    expect(headers[1].text()).toContain('Age');
  });

  it('renders data rows', () => {
    const wrapper = createTable();
    const rows = wrapper.findAll('.crazy-table__row');
    expect(rows).toHaveLength(3);
  });

  it('renders cell content', () => {
    const wrapper = createTable();
    const rows = wrapper.findAll('.crazy-table__row');
    const cells = rows[0].findAll('.crazy-table__cell');
    expect(cells[0].text()).toBe('Alice');
    expect(cells[1].text()).toBe('28');
  });

  // 2. Empty state
  it('renders empty state when data is empty', () => {
    const wrapper = createTable({ data: [] });
    expect(wrapper.find('.crazy-table__empty').exists()).toBe(true);
    expect(wrapper.find('.crazy-table__empty').text()).toBe('暂无数据');
  });

  it('shows custom empty text', () => {
    const wrapper = createTable({ data: [], emptyText: '没有数据' });
    expect(wrapper.find('.crazy-table__empty').text()).toBe('没有数据');
  });

  // 3. Size
  it('applies small size class', () => {
    const wrapper = createTable({ size: 'small' });
    expect(wrapper.classes()).toContain('crazy-table--small');
  });

  it('applies large size class', () => {
    const wrapper = createTable({ size: 'large' });
    expect(wrapper.classes()).toContain('crazy-table--large');
  });

  // 4. Border
  it('applies bordered class', () => {
    const wrapper = createTable({ bordered: true });
    expect(wrapper.classes()).toContain('is-bordered');
  });

  // 5. Stripe
  it('applies stripe class', () => {
    const wrapper = createTable({ stripe: true });
    expect(wrapper.classes()).toContain('is-stripe');
    const rows = wrapper.findAll('.crazy-table__row');
    expect(rows[1].classes()).toContain('is-stripe');
  });

  // 6. Loading
  it('shows loading overlay', () => {
    const wrapper = createTable({ loading: true });
    expect(wrapper.find('.crazy-table__loading').exists()).toBe(true);
  });

  it('hides loading by default', () => {
    const wrapper = createTable();
    expect(wrapper.find('.crazy-table__loading').exists()).toBe(false);
  });

  // 7. Column width
  it('applies column width style', () => {
    const cols = [
      { dataIndex: 'name', title: 'Name', key: 'name', width: 200 },
      { dataIndex: 'age', title: 'Age', key: 'age' },
    ];
    const wrapper = createTable({ columns: cols });
    const header = wrapper.find('.crazy-table__cell--header');
    expect(header.attributes('style')).toContain('width: 200px');
  });

  // 8. Sort click
  it('shows sort icons on sortable columns', () => {
    const wrapper = createTable();
    const sortIcons = wrapper.findAll('.crazy-table__sort-icon');
    expect(sortIcons).toHaveLength(1); // only age is sortable
  });

  it('emits sort-change on header click', async () => {
    const wrapper = createTable();
    const sortableHeader = wrapper.findAll('.crazy-table__cell--header.is-sortable');
    await sortableHeader[0].trigger('click');
    expect(wrapper.emitted('sort-change')).toHaveLength(1);
  });

  // 9. Row click
  it('emits row-click event', async () => {
    const wrapper = createTable();
    await wrapper.find('.crazy-table__row').trigger('click');
    expect(wrapper.emitted('row-click')).toHaveLength(1);
    expect(wrapper.emitted('row-click')?.[0][0]).toMatchObject({
      id: 1,
      name: 'Alice',
      age: 28,
    });
  });

  // 10. Hide header
  it('hides header when showHeader is false', () => {
    const wrapper = createTable({ showHeader: false });
    expect(wrapper.find('.crazy-table__header').exists()).toBe(false);
  });

  // 11. Formatter
  it('uses formatter function', () => {
    const cols = [
      {
        dataIndex: 'name',
        title: 'Name',
        key: 'name',
        formatter: (row: any) => `Hello ${row.name}`,
      },
      { dataIndex: 'age', title: 'Age', key: 'age' },
    ];
    const wrapper = createTable({ columns: cols });
    const firstCell = wrapper.find('.crazy-table__row .crazy-table__cell');
    expect(firstCell.text()).toBe('Hello Alice');
  });

  // 12. Selection
  it('shows checkbox column when rowSelection type is checkbox', () => {
    const wrapper = createTable({
      rowSelection: { type: 'checkbox' },
    });
    expect(wrapper.find('.crazy-table__cell--selection').exists()).toBe(true);
  });

  it('does not show checkbox by default', () => {
    const wrapper = createTable();
    expect(wrapper.find('.crazy-table__cell--selection').exists()).toBe(false);
  });

  it('selects rows on checkbox click', async () => {
    const wrapper = createTable({
      rowSelection: { type: 'checkbox' },
    });
    const checkbox = wrapper.find('.crazy-table__row .crazy-table__cell--selection input');
    await checkbox.trigger('change');
    expect(wrapper.emitted('selection-change')).toHaveLength(1);
  });

  // 13. maxHeight / height
  it('applies maxHeight style', () => {
    const wrapper = createTable({ maxHeight: 400 });
    const inner = wrapper.find('.crazy-table__wrapper');
    expect(inner.attributes('style')).toContain('max-height: 400px');
  });
});
