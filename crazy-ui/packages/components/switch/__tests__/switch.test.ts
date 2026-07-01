import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Switch from '../src/switch.vue';

describe('Switch', () => {
  it('renders correctly', () => {
    const wrapper = mount(Switch);
    expect(wrapper.find('.crazy-switch').exists()).toBe(true);
    expect(wrapper.attributes('role')).toBe('switch');
  });

  it('toggles on click', async () => {
    const wrapper = mount(Switch, { props: { modelValue: false } });
    expect(wrapper.classes()).not.toContain('is-checked');
    await wrapper.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  it('toggles off on click when checked', async () => {
    const wrapper = mount(Switch, { props: { modelValue: true } });
    expect(wrapper.classes()).toContain('is-checked');
    await wrapper.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('supports custom activeValue/inactiveValue', async () => {
    const wrapper = mount(Switch, {
      props: { modelValue: 'on', activeValue: 'on', inactiveValue: 'off' },
    });
    expect(wrapper.classes()).toContain('is-checked');
    await wrapper.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['off']);
  });

  it('does not toggle when disabled', async () => {
    const wrapper = mount(Switch, {
      props: { modelValue: false, disabled: true },
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('applies disabled class and aria', () => {
    const wrapper = mount(Switch, { props: { disabled: true } });
    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.attributes('aria-disabled')).toBe('true');
  });

  it('applies loading state', () => {
    const wrapper = mount(Switch, { props: { loading: true } });
    expect(wrapper.classes()).toContain('is-loading');
  });

  it('does not toggle when loading', async () => {
    const wrapper = mount(Switch, {
      props: { modelValue: false, loading: true },
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('emits change event', async () => {
    const wrapper = mount(Switch, { props: { modelValue: false } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('supports beforeChange async guard — allow', async () => {
    const beforeChange = vi.fn().mockResolvedValue(true);
    const wrapper = mount(Switch, {
      props: { modelValue: false, beforeChange },
    });
    await wrapper.trigger('click');
    expect(beforeChange).toHaveBeenCalledWith(true);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  it('supports beforeChange async guard — deny', async () => {
    const beforeChange = vi.fn().mockResolvedValue(false);
    const wrapper = mount(Switch, {
      props: { modelValue: false, beforeChange },
    });
    await wrapper.trigger('click');
    expect(beforeChange).toHaveBeenCalledWith(true);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('applies size class', () => {
    const wrapper = mount(Switch, { props: { size: 'small' } });
    expect(wrapper.classes()).toContain('crazy-switch--small');
  });

  it('renders inline prompt text when checked', () => {
    const wrapper = mount(Switch, {
      props: { modelValue: true, activeText: 'ON', inlinePrompt: true },
    });
    expect(wrapper.text()).toContain('ON');
  });

  it('renders inline prompt text when unchecked', () => {
    const wrapper = mount(Switch, {
      props: { modelValue: false, inactiveText: 'OFF', inlinePrompt: true },
    });
    expect(wrapper.text()).toContain('OFF');
  });

  it('aria-checked reflects state', () => {
    const wrapper = mount(Switch, { props: { modelValue: true } });
    expect(wrapper.attributes('aria-checked')).toBe('true');
  });
});
