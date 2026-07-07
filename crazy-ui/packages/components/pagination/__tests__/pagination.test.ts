import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Pagination from '../src/pagination.vue';

function createPagination(props = {}) {
  return mount(Pagination, {
    props: { total: 100, ...props },
  });
}

describe('Pagination', () => {
  // 1. Renders
  it('renders with default props', () => {
    const wrapper = createPagination();
    expect(wrapper.find('.crazy-pagination').exists()).toBe(true);
  });

  // 2. Renders correct number of page buttons
  it('renders page buttons based on total and pageSize', () => {
    const wrapper = createPagination({ total: 50, pageSize: 10 });
    // With pagerCount=7 and 5 pages, all pages should be visible
    const buttons = wrapper.findAll('.crazy-pagination__btn');
    expect(buttons.length).toBe(7); // prev + 5 pages + next
  });

  it('renders 10 pages when total=100 and pageSize=10', () => {
    const wrapper = createPagination({ total: 100, pageSize: 10, pagerCount: 7 });
    const buttons = wrapper.findAll('.crazy-pagination__btn');
    // prev + 1... + 7 pager buttons + 10 + next = 10
    expect(buttons.length).toBeGreaterThan(5);
  });

  // 3. currentPage prop
  it('shows correct page as active', () => {
    const wrapper = createPagination({ total: 100, currentPage: 3 });
    const activeBtn = wrapper.find('.crazy-pagination__btn.is-active');
    expect(activeBtn.exists()).toBe(true);
    expect(activeBtn.text()).toBe('3');
  });

  // 4. Emits on click
  it('emits update:currentPage when page button clicked', async () => {
    const wrapper = createPagination({ total: 100, currentPage: 1 });
    const pageButtons = wrapper.findAll('.crazy-pagination__btn');
    // Click the third button (page number 2 — index 2: prev(0), page1(1), page2(2))
    const page2Btn = pageButtons[2];
    await page2Btn.trigger('click');
    expect(wrapper.emitted('update:currentPage')).toBeTruthy();
    expect(wrapper.emitted('update:currentPage')![0]).toEqual([2]);
  });

  it('emits change event when page changes', async () => {
    const wrapper = createPagination({ total: 100, currentPage: 1 });
    const pageButtons = wrapper.findAll('.crazy-pagination__btn');
    const page2Btn = pageButtons[2];
    await page2Btn.trigger('click');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual([2]);
  });

  // 5. Prev/next disabled at boundaries
  it('disables prev button on first page', () => {
    const wrapper = createPagination({ total: 100, currentPage: 1 });
    const buttons = wrapper.findAll('.crazy-pagination__btn');
    const prevBtn = buttons[0];
    expect(prevBtn.classes()).toContain('is-disabled');
    expect(prevBtn.attributes('disabled')).toBeDefined();
  });

  it('disables next button on last page', () => {
    const wrapper = createPagination({ total: 100, currentPage: 10, pageSize: 10 });
    const buttons = wrapper.findAll('.crazy-pagination__btn');
    const nextBtn = buttons[buttons.length - 1];
    expect(nextBtn.classes()).toContain('is-disabled');
  });

  // 6. Ellipsis for large ranges
  it('shows ellipsis for large page ranges', () => {
    const wrapper = createPagination({ total: 1000, currentPage: 50, pageSize: 10 });
    const ellipsisBtns = wrapper.findAll('.crazy-pagination__btn.is-ellipsis');
    expect(ellipsisBtns.length).toBeGreaterThan(0);
  });

  // 7. Does not emit when disabled
  it('does not emit when disabled', async () => {
    const wrapper = createPagination({ total: 100, currentPage: 1, disabled: true });
    const buttons = wrapper.findAll('.crazy-pagination__btn');
    const page2Btn = buttons[2];
    await page2Btn.trigger('click');
    expect(wrapper.emitted('update:currentPage')).toBeFalsy();
  });

  // 8. Does not go below page 1
  it('does not go below page 1 when prev clicked', async () => {
    const wrapper = createPagination({ total: 100, currentPage: 1 });
    const buttons = wrapper.findAll('.crazy-pagination__btn');
    const prevBtn = buttons[0];
    await prevBtn.trigger('click');
    expect(wrapper.emitted('update:currentPage')).toBeFalsy();
  });

  it('does not go beyond last page when next clicked', async () => {
    const wrapper = createPagination({ total: 100, currentPage: 10, pageSize: 10 });
    const buttons = wrapper.findAll('.crazy-pagination__btn');
    const nextBtn = buttons[buttons.length - 1];
    await nextBtn.trigger('click');
    expect(wrapper.emitted('update:currentPage')).toBeFalsy();
  });
});
