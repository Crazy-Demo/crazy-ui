/**
 * Button Component Tests
 */

import { describe, it, expect } from 'vitest';
import { h, defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import Button from '../src/button.vue';

const DummyIcon = defineComponent({
  render: () => h('svg', { class: 'dummy-icon' }),
});

describe('Button', () => {
  it('renders correctly', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' },
    });
    expect(wrapper.text()).toBe('Click me');
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('applies size class correctly', () => {
    const wrapper = mount(Button, { props: { size: 'small' } });
    expect(wrapper.classes()).toContain('crazy-button--small');
  });

  it('applies variant class correctly', () => {
    const wrapper = mount(Button, { props: { variant: 'outline' } });
    expect(wrapper.classes()).toContain('crazy-button--outline');
  });

  it('applies color class correctly', () => {
    const wrapper = mount(Button, { props: { color: 'success' } });
    expect(wrapper.classes()).toContain('crazy-button--success');
  });

  it('handles disabled state', () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('handles loading state', () => {
    const wrapper = mount(Button, { props: { loading: true } });
    expect(wrapper.classes()).toContain('is-loading');
    expect(wrapper.find('.crazy-button__loading').exists()).toBe(true);
  });

  it('renders default loading spinner', () => {
    const wrapper = mount(Button, { props: { loading: true } });
    const el = wrapper.find('.crazy-button__loading-icon');
    expect(el.exists()).toBe(true);
    // no emoji, empty span
    expect(el.text()).toBe('');
  });

  it('renders custom loading icon from prop', () => {
    const wrapper = mount(Button, {
      props: { loading: true, loadingIcon: DummyIcon },
    });
    expect(wrapper.find('.dummy-icon').exists()).toBe(true);
  });

  it('renders icon from prop', () => {
    const wrapper = mount(Button, { props: { icon: DummyIcon } });
    expect(wrapper.find('.dummy-icon').exists()).toBe(true);
  });

  it('renders icon from slot', () => {
    const wrapper = mount(Button, {
      slots: { icon: h('svg', { class: 'slot-icon' }) },
    });
    expect(wrapper.find('.slot-icon').exists()).toBe(true);
  });

  it('applies circle class', () => {
    const wrapper = mount(Button, { props: { circle: true } });
    expect(wrapper.classes()).toContain('crazy-button--circle');
  });

  it('emits click event', async () => {
    const wrapper = mount(Button);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('does not emit click when loading', async () => {
    const wrapper = mount(Button, { props: { loading: true } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('applies correct native type', () => {
    const wrapper = mount(Button, { props: { nativeType: 'submit' } });
    expect(wrapper.find('button').attributes('type')).toBe('submit');
  });
});
