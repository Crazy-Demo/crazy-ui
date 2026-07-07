import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Card from '../src/card.vue';

describe('Card', () => {
  // 1. Render with default slot
  it('renders default slot content', () => {
    const wrapper = mount(Card, { slots: { default: 'Card body' } });
    expect(wrapper.text()).toContain('Card body');
    expect(wrapper.find('.crazy-card').exists()).toBe(true);
  });

  // 2. Render title prop
  it('renders title prop', () => {
    const wrapper = mount(Card, { props: { title: 'Card Title' } });
    expect(wrapper.find('.crazy-card__header').exists()).toBe(true);
    expect(wrapper.find('.crazy-card__header').text()).toContain('Card Title');
  });

  // 3. Render header slot over title prop
  it('renders header slot over title prop', () => {
    const wrapper = mount(Card, {
      props: { title: 'Prop Title' },
      slots: { header: 'Slot Header' },
    });
    expect(wrapper.find('.crazy-card__header').text()).toContain('Slot Header');
    expect(wrapper.find('.crazy-card__header').text()).not.toContain('Prop Title');
  });

  // 4. Render footer slot
  it('renders footer slot', () => {
    const wrapper = mount(Card, { slots: { footer: 'Footer content' } });
    expect(wrapper.find('.crazy-card__footer').exists()).toBe(true);
    expect(wrapper.find('.crazy-card__footer').text()).toContain('Footer content');
  });

  // 5. Do not show header when no title and no header slot
  it('does not show header when no title and no header slot', () => {
    const wrapper = mount(Card, { slots: { default: 'Body' } });
    expect(wrapper.find('.crazy-card__header').exists()).toBe(false);
  });

  // 6. Do not show footer when no footer slot
  it('does not show footer when no footer slot', () => {
    const wrapper = mount(Card, { slots: { default: 'Body' } });
    expect(wrapper.find('.crazy-card__footer').exists()).toBe(false);
  });

  // 7. Apply shadow class when shadow is "always"
  it('applies is-shadow class when shadow is always', () => {
    const wrapper = mount(Card, { props: { shadow: 'always' } });
    expect(wrapper.find('.crazy-card').classes()).toContain('is-shadow');
  });

  // 8. Apply hover shadow class when shadow is "hover"
  it('applies is-hover-shadow class when shadow is hover', () => {
    const wrapper = mount(Card, { props: { shadow: 'hover' } });
    expect(wrapper.find('.crazy-card').classes()).toContain('is-hover-shadow');
  });

  // 9. No shadow class when shadow is "never" (default)
  it('does not apply shadow class when shadow is never', () => {
    const wrapper = mount(Card, { props: { shadow: 'never' } });
    expect(wrapper.find('.crazy-card').classes()).not.toContain('is-shadow');
    expect(wrapper.find('.crazy-card').classes()).not.toContain('is-hover-shadow');
  });

  // 10. Default shadow prop is "never"
  it('has default shadow prop as never', () => {
    const wrapper = mount(Card, { slots: { default: 'Body' } });
    expect(wrapper.find('.crazy-card').classes()).not.toContain('is-shadow');
  });
});
