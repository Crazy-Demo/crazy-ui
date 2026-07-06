import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Tooltip from '../src/tooltip.vue';

// Helper to create a tooltip wrapper
function createTooltip(props = {}, slots = {}) {
  return mount(Tooltip, {
    props: { ...props },
    slots: { default: 'Trigger', ...slots },
    attachTo: document.body,
  });
}

describe('Tooltip', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 1. Renders slot content
  it('renders slot content', () => {
    const wrapper = createTooltip();
    expect(wrapper.text()).toContain('Trigger');
  });

  // 2. Shows tooltip on hover
  it('shows tooltip on mouseenter (hover trigger)', async () => {
    const wrapper = createTooltip({ content: 'Tooltip text' });
    await wrapper.trigger('mouseenter');

    // Fast-forward past showAfter delay
    vi.advanceTimersByTime(200);
    await nextTick();

    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(true);
    expect(wrapper.find('.crazy-tooltip__content').text()).toContain(
      'Tooltip text'
    );
  });

  // 3. Hides tooltip on mouse leave
  it('hides tooltip on mouseleave', async () => {
    const wrapper = createTooltip({ content: 'Tooltip text' });
    await wrapper.trigger('mouseenter');
    vi.advanceTimersByTime(200);
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(true);

    await wrapper.trigger('mouseleave');
    vi.advanceTimersByTime(100);
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(false);
  });

  // 4. Shows tooltip on click (trigger=click)
  it('shows tooltip on click when trigger is click', async () => {
    const wrapper = createTooltip({
      content: 'Click tooltip',
      trigger: 'click',
      showAfter: 0,
    });
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(false);

    await wrapper.trigger('click');
    await nextTick();

    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(true);
    expect(wrapper.find('.crazy-tooltip__content').text()).toContain(
      'Click tooltip'
    );
  });

  it('toggles tooltip on click when trigger is click', async () => {
    const wrapper = createTooltip({
      content: 'Toggle tooltip',
      trigger: 'click',
      showAfter: 0,
      hideAfter: 0,
    });

    // First click: show
    await wrapper.trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(true);

    // Second click: hide
    await wrapper.trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(false);
  });

  // 5. Disabled: does not show
  it('does not show tooltip when disabled', async () => {
    const wrapper = createTooltip({
      content: 'Disabled tooltip',
      disabled: true,
      showAfter: 0,
    });
    await wrapper.trigger('mouseenter');
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(false);
  });

  // 6. content prop displays
  it('displays content text in tooltip', async () => {
    const wrapper = createTooltip({
      content: 'Helpful information',
      showAfter: 0,
    });
    await wrapper.trigger('mouseenter');
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').text()).toContain(
      'Helpful information'
    );
  });

  // 7. placement prop
  it('applies placement class', async () => {
    const wrapper = createTooltip({
      content: 'Placed tooltip',
      placement: 'bottom',
      showAfter: 0,
    });
    await wrapper.trigger('mouseenter');
    await nextTick();
    const content = wrapper.find('.crazy-tooltip__content');
    expect(content.classes()).toContain('crazy-tooltip__content--bottom');
  });

  it('defaults to top placement', async () => {
    const wrapper = createTooltip({
      content: 'Default tooltip',
      showAfter: 0,
    });
    await wrapper.trigger('mouseenter');
    await nextTick();
    const content = wrapper.find('.crazy-tooltip__content');
    expect(content.classes()).toContain('crazy-tooltip__content--top');
  });

  // 8. showAfter/hideAfter delay
  it('respects showAfter delay before showing', async () => {
    const wrapper = createTooltip({
      content: 'Delayed tooltip',
      showAfter: 500,
    });
    await wrapper.trigger('mouseenter');

    // Before showAfter delay
    vi.advanceTimersByTime(300);
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(false);

    // After showAfter delay
    vi.advanceTimersByTime(200);
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(true);
  });

  it('respects hideAfter delay before hiding', async () => {
    const wrapper = createTooltip({
      content: 'Hide delayed',
      showAfter: 0,
      hideAfter: 300,
    });
    await wrapper.trigger('mouseenter');
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(true);

    await wrapper.trigger('mouseleave');
    // Before hideAfter delay
    vi.advanceTimersByTime(100);
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(true);

    // After hideAfter delay
    vi.advanceTimersByTime(200);
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(false);
  });

  // 9. Tooltip role
  it('has role="tooltip"', async () => {
    const wrapper = createTooltip({
      content: 'Accessible tooltip',
      showAfter: 0,
    });
    await wrapper.trigger('mouseenter');
    await nextTick();
    expect(
      wrapper.find('.crazy-tooltip__content').attributes('role')
    ).toBe('tooltip');
  });

  // 10. Arrow element exists
  it('renders arrow element', async () => {
    const wrapper = createTooltip({ content: 'Arrow tooltip', showAfter: 0 });
    await wrapper.trigger('mouseenter');
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__arrow').exists()).toBe(true);
  });

  // 11. offset prop
  it('accepts offset prop', () => {
    const wrapper = createTooltip({ offset: 16 });
    expect(wrapper.props('offset')).toBe(16);
  });

  // 12. Shows tooltip immediately when showAfter is 0
  it('shows immediately when showAfter is 0', async () => {
    const wrapper = createTooltip({ content: 'Immediate', showAfter: 0 });
    await wrapper.trigger('mouseenter');
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(true);
  });

  // 13. Hides immediately when hideAfter is 0
  it('hides immediately when hideAfter is 0', async () => {
    const wrapper = createTooltip({
      content: 'Immediate hide',
      showAfter: 0,
      hideAfter: 0,
    });
    await wrapper.trigger('mouseenter');
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(true);

    await wrapper.trigger('mouseleave');
    await nextTick();
    expect(wrapper.find('.crazy-tooltip__content').exists()).toBe(false);
  });
});
