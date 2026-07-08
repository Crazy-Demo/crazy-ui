import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Avatar from '../src/avatar.vue';

function createAvatar(props = {}) {
  return mount(Avatar, { props, slots: {} });
}

describe('Avatar', () => {
  it('renders with default props', () => {
    const wrapper = createAvatar();
    expect(wrapper.classes()).toContain('crazy-avatar');
    expect(wrapper.classes()).toContain('crazy-avatar--circle');
    expect(wrapper.classes()).toContain('crazy-avatar--medium');
  });

  it('renders square shape', () => {
    const wrapper = createAvatar({ shape: 'square' });
    expect(wrapper.classes()).toContain('crazy-avatar--square');
  });

  it('renders image when src is provided', () => {
    const wrapper = createAvatar({ src: 'https://example.com/avatar.png' });
    expect(wrapper.find('img').exists()).toBe(true);
  });

  it('renders fallback text from alt', () => {
    const wrapper = createAvatar({ alt: 'John Doe' });
    expect(wrapper.text()).toBe('J');
  });

  it('hides image on error and shows fallback', async () => {
    const wrapper = createAvatar({ src: 'invalid.png', alt: 'John' });
    await wrapper.find('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.text()).toBe('J');
  });

  it('applies numeric size', () => {
    const wrapper = createAvatar({ size: 60 });
    const el = wrapper.element as HTMLElement;
    expect(el.style.width).toBe('60px');
    expect(el.style.height).toBe('60px');
  });

  it('applies semantic size', () => {
    const s = createAvatar({ size: 'large' });
    expect((s.element as HTMLElement).style.width).toBe('48px');
    const m = createAvatar({ size: 'small' });
    expect((m.element as HTMLElement).style.width).toBe('32px');
  });

  it('renders icon slot', () => {
    const wrapper = createAvatar({ icon: '★' });
    expect(wrapper.text()).toBe('★');
  });

  it('applies object-fit style', () => {
    const wrapper = createAvatar({ src: 'test.png', fit: 'contain' });
    expect(wrapper.find('img').attributes('style')).toContain('object-fit: contain');
  });

  it('renders default slot as fallback', () => {
    const wrapper = mount(Avatar, {
      props: {},
      slots: { default: '<span class="custom">X</span>' },
    });
    expect(wrapper.find('.custom').exists()).toBe(true);
  });
});
