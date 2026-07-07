import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Divider from '../src/divider.vue';

function createDivider(props = {}, slots = {}) {
  return mount(Divider, {
    props: { ...props },
    slots,
  });
}

describe('Divider', () => {
  // 1. Renders
  it('renders with default props', () => {
    const wrapper = createDivider();
    expect(wrapper.find('.crazy-divider').exists()).toBe(true);
  });

  it('has role separator', () => {
    const wrapper = createDivider();
    expect(wrapper.attributes('role')).toBe('separator');
  });

  // 2. direction class
  it('renders horizontal by default', () => {
    const wrapper = createDivider();
    expect(wrapper.classes()).toContain('crazy-divider--horizontal');
  });

  it('renders vertical direction class', () => {
    const wrapper = createDivider({ direction: 'vertical' });
    expect(wrapper.classes()).toContain('crazy-divider--vertical');
  });

  // 3. dashed class
  it('renders with dashed class when dashed is true', () => {
    const wrapper = createDivider({ dashed: true });
    expect(wrapper.classes()).toContain('is-dashed');
  });

  it('does not have dashed class by default', () => {
    const wrapper = createDivider();
    expect(wrapper.classes()).not.toContain('is-dashed');
  });

  // 4. slot text
  it('renders slot text', () => {
    const wrapper = createDivider({}, { default: '分隔线' });
    expect(wrapper.find('.crazy-divider__text').exists()).toBe(true);
    expect(wrapper.find('.crazy-divider__text').text()).toBe('分隔线');
  });

  it('does not render text element when no slot', () => {
    const wrapper = createDivider();
    expect(wrapper.find('.crazy-divider__text').exists()).toBe(false);
  });
});
