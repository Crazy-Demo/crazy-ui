import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Dropdown from '../src/dropdown.vue';

function createDropdown(props = {}, slots = {}) {
  return mount(Dropdown, {
    props: { ...props },
    slots: {
      default: '<button id="trigger-btn">Open</button>',
      dropdown: '<div class="menu-item">Item 1</div><div class="menu-item">Item 2</div>',
      ...slots,
    },
    attachTo: document.body,
  });
}

describe('Dropdown', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // 1. Opens on click
  it('opens menu on click', async () => {
    const wrapper = createDropdown();
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(false);

    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();

    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(true);
  });

  // 2. Toggles on second click
  it('toggles on second click', async () => {
    const wrapper = createDropdown();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(true);

    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(false);
  });

  // 3. Hides on click-outside
  it('hides on click-outside', async () => {
    const wrapper = createDropdown();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(true);

    document.dispatchEvent(new MouseEvent('mousedown'));
    await nextTick();

    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(false);
  });

  // 4. Shows on hover (trigger=hover)
  it('shows on hover (trigger=hover)', async () => {
    const wrapper = createDropdown({ trigger: 'hover' });
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(false);

    await wrapper.trigger('mouseenter');
    await nextTick();

    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(true);
  });

  // 5. Hides on mouseleave (trigger=hover)
  it('hides on mouseleave (trigger=hover)', async () => {
    const wrapper = createDropdown({ trigger: 'hover' });
    await wrapper.trigger('mouseenter');
    await nextTick();
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(true);

    await wrapper.trigger('mouseleave');
    await nextTick();

    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(false);
  });

  // 6. Disabled prevents opening
  it('disabled prevents opening', async () => {
    const wrapper = createDropdown({ disabled: true });
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(false);
  });

  // 7. hideOnClick hides menu when clicking an item
  it('hideOnClick hides menu on item click', async () => {
    const wrapper = createDropdown();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(true);

    await wrapper.find('.menu-item').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(false);
  });

  it('hideOnClick=false keeps menu open on item click', async () => {
    const wrapper = createDropdown({ hideOnClick: false });
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(true);

    await wrapper.find('.menu-item').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(true);
  });

  // 8. Placement prop
  it('accepts placement prop', () => {
    const wrapper = createDropdown({ placement: 'bottom-end' });
    expect(wrapper.props('placement')).toBe('bottom-end');
  });

  // 9. Renders menu slot
  it('renders dropdown slot content', async () => {
    const wrapper = createDropdown();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();

    const menu = wrapper.find('.crazy-dropdown__menu');
    expect(menu.text()).toContain('Item 1');
    expect(menu.text()).toContain('Item 2');
  });

  // 10. v-model:modelValue controlled mode
  it('controlled via v-model', async () => {
    const wrapper = createDropdown({ modelValue: true });
    await nextTick();

    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(true);

    await wrapper.setProps({ modelValue: false });
    await nextTick();
    expect(wrapper.find('.crazy-dropdown__menu').exists()).toBe(false);
  });

  // 11. Has role="menu"
  it('has role="menu"', async () => {
    const wrapper = createDropdown();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-dropdown__menu').attributes('role')).toBe('menu');
  });

  // 12. Emits visible-change
  it('emits visible-change on open', async () => {
    const wrapper = createDropdown();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.emitted('visible-change')).toBeTruthy();
    expect(wrapper.emitted('visible-change')![0]).toEqual([true]);
  });

  it('emits visible-change on close', async () => {
    const wrapper = createDropdown();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    const emits = wrapper.emitted('visible-change')!;
    expect(emits[1]).toEqual([false]);
  });
});
