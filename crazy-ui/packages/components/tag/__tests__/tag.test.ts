import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Tag from '../src/tag.vue';

function createTag(props = {}, slots = {}) {
  return mount(Tag, {
    props: { ...props },
    slots: { default: 'Tag Label', ...slots },
  });
}

describe('Tag', () => {
  // 1. Renders with type class
  it('renders with type class', () => {
    const wrapper = createTag({ type: 'success' });
    expect(wrapper.classes()).toContain('crazy-tag--success');
  });

  it('defaults to info type', () => {
    const wrapper = createTag();
    expect(wrapper.classes()).toContain('crazy-tag--info');
  });

  // 2. Renders slot content
  it('renders slot content', () => {
    const wrapper = createTag({}, { default: 'Custom Label' });
    expect(wrapper.text()).toContain('Custom Label');
  });

  // 3. Closable shows X and emits close
  it('shows close button when closable', () => {
    const wrapper = createTag({ closable: true });
    expect(wrapper.find('.crazy-tag__close').exists()).toBe(true);
  });

  it('emits close event when close button clicked', () => {
    const wrapper = createTag({ closable: true });
    wrapper.find('.crazy-tag__close').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')![0][0]).toBeInstanceOf(MouseEvent);
  });

  it('does not show close button when not closable', () => {
    const wrapper = createTag();
    expect(wrapper.find('.crazy-tag__close').exists()).toBe(false);
  });

  // 4. Size classes
  it('renders with small size class', () => {
    const wrapper = createTag({ size: 'small' });
    expect(wrapper.classes()).toContain('crazy-tag--small');
  });

  it('renders with medium size class', () => {
    const wrapper = createTag({ size: 'medium' });
    expect(wrapper.classes()).toContain('crazy-tag--medium');
  });

  it('renders with large size class', () => {
    const wrapper = createTag({ size: 'large' });
    expect(wrapper.classes()).toContain('crazy-tag--large');
  });

  // 5. Effect classes
  it('renders with light effect class', () => {
    const wrapper = createTag({ effect: 'light' });
    expect(wrapper.classes()).toContain('crazy-tag--light');
  });

  it('renders with dark effect class', () => {
    const wrapper = createTag({ effect: 'dark' });
    expect(wrapper.classes()).toContain('crazy-tag--dark');
  });

  it('renders with plain effect class', () => {
    const wrapper = createTag({ effect: 'plain' });
    expect(wrapper.classes()).toContain('crazy-tag--plain');
  });

  // 6. Round class
  it('renders with round class when round is true', () => {
    const wrapper = createTag({ round: true });
    expect(wrapper.classes()).toContain('is-round');
  });

  it('does not have round class when round is false', () => {
    const wrapper = createTag({ round: false });
    expect(wrapper.classes()).not.toContain('is-round');
  });

  // 7. Color prop
  it('applies custom color style', () => {
    const wrapper = createTag({ color: '#ff6600' });
    const style = wrapper.attributes('style');
    expect(style).toBeTruthy();
  });

  it('applies light effect color style', () => {
    const wrapper = createTag({ color: '#ff6600', effect: 'light' });
    const style = wrapper.attributes('style') || '';
    expect(style).toContain('color: rgb(255, 102, 0)');
  });

  it('applies dark effect color style', () => {
    const wrapper = createTag({ color: '#ff6600', effect: 'dark' });
    const style = wrapper.attributes('style') || '';
    expect(style).toContain('background-color: rgb(255, 102, 0)');
    expect(style).toContain('color: rgb(255, 255, 255)');
  });

  // 8. Emits click event
  it('emits click event when clicked', () => {
    const wrapper = createTag();
    wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  // 9. Close click does not emit click
  it('does not emit click when close button clicked', () => {
    const wrapper = createTag({ closable: true });
    wrapper.find('.crazy-tag__close').trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });
});
