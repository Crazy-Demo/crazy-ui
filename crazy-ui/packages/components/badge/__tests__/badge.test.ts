import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Badge from '../src/badge.vue';

function createBadge(props = {}, slots = {}) {
  return mount(Badge, {
    props: { ...props },
    slots: { default: '<span>Inbox</span>', ...slots },
  });
}

describe('Badge', () => {
  // 1. Renders with value
  it('renders with value', () => {
    const wrapper = createBadge({ value: 5 });
    expect(wrapper.find('.crazy-badge__content').exists()).toBe(true);
    expect(wrapper.find('.crazy-badge__content').text()).toBe('5');
  });

  it('renders with string value', () => {
    const wrapper = createBadge({ value: 'new' });
    expect(wrapper.find('.crazy-badge__content').text()).toBe('new');
  });

  // 2. isDot shows dot
  it('shows dot when isDot is true', () => {
    const wrapper = createBadge({ isDot: true });
    const content = wrapper.find('.crazy-badge__content');
    expect(content.exists()).toBe(true);
    expect(content.classes()).toContain('is-dot');
  });

  it('dot has empty text', () => {
    const wrapper = createBadge({ isDot: true });
    expect(wrapper.find('.crazy-badge__content').text()).toBe('');
  });

  // 3. max caps display value
  it('caps display value at max', () => {
    const wrapper = createBadge({ value: 100, max: 99 });
    expect(wrapper.find('.crazy-badge__content').text()).toBe('99+');
  });

  it('shows actual value when below max', () => {
    const wrapper = createBadge({ value: 50, max: 99 });
    expect(wrapper.find('.crazy-badge__content').text()).toBe('50');
  });

  // 4. hidden hides badge
  it('hides badge when hidden is true', () => {
    const wrapper = createBadge({ hidden: true });
    expect(wrapper.find('.crazy-badge__content').exists()).toBe(false);
  });

  // 5. type color classes
  it('renders with danger type by default', () => {
    const wrapper = createBadge({ value: 1 });
    expect(wrapper.find('.crazy-badge__content').classes()).toContain(
      'crazy-badge__content--danger',
    );
  });

  it('renders with primary type class', () => {
    const wrapper = createBadge({ value: 1, type: 'primary' });
    expect(wrapper.find('.crazy-badge__content').classes()).toContain(
      'crazy-badge__content--primary',
    );
  });

  it('renders with success type class', () => {
    const wrapper = createBadge({ value: 1, type: 'success' });
    expect(wrapper.find('.crazy-badge__content').classes()).toContain(
      'crazy-badge__content--success',
    );
  });

  it('renders with warning type class', () => {
    const wrapper = createBadge({ value: 1, type: 'warning' });
    expect(wrapper.find('.crazy-badge__content').classes()).toContain(
      'crazy-badge__content--warning',
    );
  });

  it('renders with info type class', () => {
    const wrapper = createBadge({ value: 1, type: 'info' });
    expect(wrapper.find('.crazy-badge__content').classes()).toContain(
      'crazy-badge__content--info',
    );
  });

  // 6. Slot content renders
  it('renders slot content', () => {
    const wrapper = createBadge({}, { default: '<span class="icon">🔔</span>' });
    expect(wrapper.find('.icon').exists()).toBe(true);
  });

  // 7. is-fixed class when no slot
  it('has is-fixed class when no default slot', () => {
    const wrapper = mount(Badge, {
      props: { value: 5 },
    });
    expect(wrapper.find('.crazy-badge__content').classes()).toContain(
      'is-fixed',
    );
  });

  it('does not have is-fixed class when slot exists', () => {
    const wrapper = createBadge({ value: 5 });
    expect(
      wrapper.find('.crazy-badge__content').classes(),
    ).not.toContain('is-fixed');
  });
});
