import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Select from '../src/select.vue';

describe('Select', () => {
  it('renders with placeholder', () => {
    const wrapper = mount(Select);
    expect(wrapper.find('.crazy-select').exists()).toBe(true);
    expect(wrapper.text()).toContain('请选择');
  });

  it('opens dropdown on click', async () => {
    const wrapper = mount(Select, {
      props: { options: [{ value: 'a', label: 'A' }] },
    });
    await wrapper.trigger('click');
    expect(wrapper.find('.crazy-select__dropdown').isVisible()).toBe(true);
  });

  it('selects an option and emits', async () => {
    const wrapper = mount(Select, {
      props: { options: [{ value: 'a', label: 'A' }] },
    });
    await wrapper.trigger('click');
    await wrapper.find('.crazy-select__option').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['a']);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('emits update:modelValue and change after selecting option', async () => {
    const wrapper = mount(Select, {
      props: { options: [{ value: 'x', label: 'X' }] },
    });
    await wrapper.trigger('click'); // open dropdown
    await wrapper.find('.crazy-select__option').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['x']);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('supports multiple select', async () => {
    const wrapper = mount(Select, {
      props: {
        multiple: true,
        modelValue: [],
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      },
    });
    await wrapper.trigger('click');
    const options = wrapper.findAll('.crazy-select__option');
    await options[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a']]);
  });

  it('shows selected label', () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'b',
        options: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ],
      },
    });
    expect(wrapper.text()).toContain('Beta');
  });

  it('shows clear icon when clearable and has value', () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'a',
        clearable: true,
        options: [{ value: 'a', label: 'A' }],
      },
    });
    expect(wrapper.find('.crazy-select__clear').exists()).toBe(true);
  });

  it('clears value on clear click', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'a',
        clearable: true,
        options: [{ value: 'a', label: 'A' }],
      },
    });
    await wrapper.find('.crazy-select__clear').trigger('click');
    expect(wrapper.emitted('clear')).toBeTruthy();
  });

  it('filters options when filterable', async () => {
    const wrapper = mount(Select, {
      props: {
        filterable: true,
        options: [
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
        ],
      },
    });
    await wrapper.trigger('click');
    const input = wrapper.find('.crazy-select__search-input');
    await input.setValue('app');
    // Should only show Apple, not Banana
    const options = wrapper.findAll('.crazy-select__option');
    expect(options.length).toBe(1);
    expect(options[0].text()).toContain('Apple');
  });

  it('supports disabled state', () => {
    const wrapper = mount(Select, { props: { disabled: true } });
    expect(wrapper.classes()).toContain('is-disabled');
  });

  it('does not open when disabled', async () => {
    const wrapper = mount(Select, {
      props: { disabled: true, options: [{ value: 'a', label: 'A' }] },
    });
    await wrapper.trigger('click');
    expect(wrapper.find('.crazy-select__dropdown').isVisible()).toBe(false);
  });

  it('applies size class', () => {
    const wrapper = mount(Select, { props: { size: 'small' } });
    expect(wrapper.classes()).toContain('crazy-select--small');
  });

  it('supports keyboard ArrowDown to open', async () => {
    const wrapper = mount(Select, {
      props: { options: [{ value: 'a', label: 'A' }] },
    });
    await wrapper.trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.find('.crazy-select__dropdown').isVisible()).toBe(true);
  });

  it('supports keyboard Escape to close dropdown', async () => {
    const wrapper = mount(Select, {
      props: { options: [{ value: 'a', label: 'A' }] },
    });
    await wrapper.trigger('click'); // open
    expect(wrapper.find('.crazy-select__dropdown').isVisible()).toBe(true);

    await wrapper.trigger('keydown', { key: 'Escape' });
    // visible-change event should emit false when dropdown closes
    const visibleChangeEvents = wrapper.emitted('visible-change') || [];
    expect(visibleChangeEvents.some(e => e[0] === false)).toBe(true);
  });
});
