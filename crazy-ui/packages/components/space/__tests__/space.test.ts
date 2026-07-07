import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Space from '../src/space.vue';

function createSpace(props = {}, slots = {}) {
  return mount(Space, {
    props: { ...props },
    slots: { default: '<span>item</span>', ...slots },
  });
}

describe('Space', () => {
  // 1. Renders
  it('renders with default props', () => {
    const wrapper = createSpace();
    expect(wrapper.find('.crazy-space').exists()).toBe(true);
  });

  // 2. direction class
  it('renders horizontal direction by default', () => {
    const wrapper = createSpace();
    expect(wrapper.classes()).toContain('crazy-space--horizontal');
  });

  it('renders vertical direction class', () => {
    const wrapper = createSpace({ direction: 'vertical' });
    expect(wrapper.classes()).toContain('crazy-space--vertical');
  });

  // 3. align class
  it('renders start align by default', () => {
    const wrapper = createSpace();
    expect(wrapper.classes()).toContain('crazy-space--start');
  });

  it('renders center align class', () => {
    const wrapper = createSpace({ align: 'center' });
    expect(wrapper.classes()).toContain('crazy-space--center');
  });

  it('renders end align class', () => {
    const wrapper = createSpace({ align: 'end' });
    expect(wrapper.classes()).toContain('crazy-space--end');
  });

  // 4. gap style from size
  it('sets gap style for medium size by default', () => {
    const wrapper = createSpace();
    expect(wrapper.attributes('style')).toContain('gap: 16px');
  });

  it('sets gap style for small size', () => {
    const wrapper = createSpace({ size: 'small' });
    expect(wrapper.attributes('style')).toContain('gap: 8px');
  });

  it('sets gap style for large size', () => {
    const wrapper = createSpace({ size: 'large' });
    expect(wrapper.attributes('style')).toContain('gap: 24px');
  });

  it('sets gap style from numeric size', () => {
    const wrapper = createSpace({ size: 32 });
    expect(wrapper.attributes('style')).toContain('gap: 32px');
  });

  // 5. wrap prop
  it('applies wrap class when wrap is true', () => {
    const wrapper = createSpace({ wrap: true });
    expect(wrapper.classes()).toContain('is-wrap');
  });

  it('does not apply wrap class by default', () => {
    const wrapper = createSpace();
    expect(wrapper.classes()).not.toContain('is-wrap');
  });

  // 6. renders slot content
  it('renders slot content', () => {
    const wrapper = createSpace({}, { default: '<span class="test-item">Item 1</span>' });
    expect(wrapper.find('.test-item').exists()).toBe(true);
    expect(wrapper.find('.test-item').text()).toBe('Item 1');
  });
});
