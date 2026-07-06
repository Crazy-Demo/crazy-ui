import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Popover from '../src/popover.vue';

function createPopover(props = {}, slots = {}) {
  return mount(Popover, {
    props: { ...props },
    slots: {
      trigger: '<button id="trigger-btn">Open</button>',
      default: 'Popover content',
      ...slots,
    },
    attachTo: document.body,
  });
}

describe('Popover', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // 1. Renders trigger slot
  it('renders trigger slot', () => {
    const wrapper = createPopover();
    expect(wrapper.find('#trigger-btn').exists()).toBe(true);
    expect(wrapper.text()).toContain('Open');
  });

  // 2. Shows popover on click
  it('shows popover on click (click trigger)', async () => {
    const wrapper = createPopover();
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(false);

    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();

    expect(wrapper.find('.crazy-popover__content').exists()).toBe(true);
    expect(wrapper.find('.crazy-popover__content').text()).toContain(
      'Popover content',
    );
  });

  // 3. Hides popover on click-outside
  it('hides on click-outside', async () => {
    const wrapper = createPopover();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(true);

    // useClickOutside listens for mousedown by default
    document.dispatchEvent(new MouseEvent('mousedown'));
    await nextTick();

    expect(wrapper.find('.crazy-popover__content').exists()).toBe(false);
  });

  // 4. Shows on hover
  it('shows on hover (hover trigger)', async () => {
    const wrapper = createPopover({ trigger: 'hover' });
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(false);

    await wrapper.trigger('mouseenter');
    await nextTick();

    expect(wrapper.find('.crazy-popover__content').exists()).toBe(true);
  });

  // 5. Hides on mouseleave (hover trigger)
  it('hides on mouseleave (hover trigger)', async () => {
    const wrapper = createPopover({ trigger: 'hover' });
    await wrapper.trigger('mouseenter');
    await nextTick();
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(true);

    await wrapper.trigger('mouseleave');
    await nextTick();
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(false);
  });

  // 6. v-model:visible controlled mode
  it('v-model:visible controlled mode', async () => {
    const wrapper = createPopover({ visible: true });
    await nextTick();

    expect(wrapper.find('.crazy-popover__content').exists()).toBe(true);

    await wrapper.setProps({ visible: false });
    await nextTick();
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(false);
  });

  // 7. Disabled prevents showing
  it('disabled prevents showing', async () => {
    const wrapper = createPopover({ disabled: true });
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(false);
  });

  // 8. Content slot renders
  it('renders content slot', async () => {
    const wrapper = createPopover(
      {},
      { trigger: '<button>Open</button>', default: 'Custom content here' },
    );
    await wrapper.find('button').trigger('click');
    await nextTick();

    expect(wrapper.find('.crazy-popover__content').text()).toContain(
      'Custom content here',
    );
  });

  // 9. placement prop
  it('accepts placement prop', () => {
    const wrapper = createPopover({ placement: 'top-start' });
    expect(wrapper.props('placement')).toBe('top-start');
  });

  // 10. width prop
  it('applies width from prop', async () => {
    const wrapper = createPopover({ width: 300 });
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();

    const content = wrapper.find('.crazy-popover__content');
    expect(content.attributes('style')).toContain('width: 300px');
  });

  it('applies string width from prop', async () => {
    const wrapper = createPopover({ width: '200px' });
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();

    const content = wrapper.find('.crazy-popover__content');
    expect(content.attributes('style')).toContain('width: 200px');
  });

  // 11. Toggle on second click
  it('toggles on second click', async () => {
    const wrapper = createPopover();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(true);

    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(false);
  });

  // 12. Arrow element
  it('renders arrow by default', async () => {
    const wrapper = createPopover();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-popover__arrow').exists()).toBe(true);
  });

  it('hides arrow when showArrow is false', async () => {
    const wrapper = createPopover({ showArrow: false });
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-popover__arrow').exists()).toBe(false);
  });

  // 13. role="dialog"
  it('has role="dialog"', async () => {
    const wrapper = createPopover();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(
      wrapper.find('.crazy-popover__content').attributes('role'),
    ).toBe('dialog');
  });

  // 14. offset prop
  it('accepts offset prop', () => {
    const wrapper = createPopover({ offset: 16 });
    expect(wrapper.props('offset')).toBe(16);
  });

  // 15. Stays visible when hovering content (hover trigger)
  it('stays visible when hovering content (hover trigger)', async () => {
    const wrapper = createPopover({ trigger: 'hover' });
    await wrapper.trigger('mouseenter');
    await nextTick();
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(true);

    // Moving mouse over content should not hide
    await wrapper.find('.crazy-popover__content').trigger('mouseenter');
    await nextTick();
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(true);

    // Moving mouse out of content should hide
    await wrapper.find('.crazy-popover__content').trigger('mouseleave');
    await nextTick();
    expect(wrapper.find('.crazy-popover__content').exists()).toBe(false);
  });

  // 16. Emits show event
  it('emits show event on open', async () => {
    const wrapper = createPopover();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.emitted('show')).toBeTruthy();
  });

  // 17. Emits hide event on close
  it('emits hide event on close', async () => {
    const wrapper = createPopover();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    await wrapper.find('#trigger-btn').trigger('click');
    await nextTick();
    expect(wrapper.emitted('hide')).toBeTruthy();
  });
});
