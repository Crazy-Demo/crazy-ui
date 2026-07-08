import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Row from '../src/row.vue';

function createRow(props = {}, slots = {}) {
  return mount(Row, { props, slots });
}

describe('Row', () => {
  it('renders as div by default', () => {
    const wrapper = createRow();
    expect(wrapper.element.tagName).toBe('DIV');
  });

  it('renders custom tag', () => {
    const wrapper = createRow({ tag: 'section' });
    expect(wrapper.element.tagName).toBe('SECTION');
  });

  it('applies default classes', () => {
    const wrapper = createRow();
    expect(wrapper.classes()).toContain('crazy-row');
    expect(wrapper.classes()).toContain('crazy-row--top');
  });

  it('applies align middle class', () => {
    const wrapper = createRow({ align: 'middle' });
    expect(wrapper.classes()).toContain('crazy-row--middle');
  });

  it('applies align bottom class', () => {
    const wrapper = createRow({ align: 'bottom' });
    expect(wrapper.classes()).toContain('crazy-row--bottom');
  });

  it('applies justify center class', () => {
    const wrapper = createRow({ justify: 'center' });
    expect(wrapper.classes()).toContain('crazy-row--justify-center');
  });

  it('applies justify space-between class', () => {
    const wrapper = createRow({ justify: 'space-between' });
    expect(wrapper.classes()).toContain('crazy-row--justify-space-between');
  });

  it('applies negative margins for gutter', () => {
    const wrapper = createRow({ gutter: 20 });
    const el = wrapper.element as HTMLElement;
    expect(el.style.marginLeft).toBe('-10px');
    expect(el.style.marginRight).toBe('-10px');
  });

  it('no margin when gutter is 0', () => {
    const wrapper = createRow({ gutter: 0 });
    const el = wrapper.element as HTMLElement;
    expect(el.style.marginLeft).toBe('');
  });

  it('applies wrap by default', () => {
    const wrapper = createRow();
    expect(wrapper.classes()).toContain('is-wrap');
  });

  it('applies nowrap when wrap is false', () => {
    const wrapper = createRow({ wrap: false });
    expect(wrapper.classes()).toContain('is-nowrap');
  });

  it('renders slot content', () => {
    const wrapper = mount(Row, {
      slots: { default: '<div class="content">content</div>' },
    });
    expect(wrapper.find('.content').exists()).toBe(true);
  });
});
