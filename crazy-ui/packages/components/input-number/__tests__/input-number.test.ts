/**
 * InputNumber Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InputNumber from '../src/input-number.vue';

describe('InputNumber', () => {
  // 1. Renders with default value
  it('renders an input element', () => {
    const wrapper = mount(InputNumber);
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('renders with initial modelValue', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 10 } });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.value).toBe('10');
  });

  // 2. Increase / decrease buttons work
  it('shows increase and decrease buttons by default', () => {
    const wrapper = mount(InputNumber);
    expect(wrapper.find('.crazy-input-number__increase').exists()).toBe(true);
    expect(wrapper.find('.crazy-input-number__decrease').exists()).toBe(true);
  });

  it('emits update:modelValue with increased value on + click', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5 } });
    await wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    await wrapper.find('.crazy-input-number__increase').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([6]);
  });

  it('emits update:modelValue with decreased value on - click', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5 } });
    await wrapper.find('.crazy-input-number__decrease').trigger('mousedown');
    await wrapper.find('.crazy-input-number__decrease').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([4]);
  });

  it('emits change event on increase', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5 } });
    await wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    await wrapper.find('.crazy-input-number__increase').trigger('mouseup');
    expect(wrapper.emitted('change')?.[0]).toEqual([6]);
  });

  it('emits change event on decrease', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5 } });
    await wrapper.find('.crazy-input-number__decrease').trigger('mousedown');
    await wrapper.find('.crazy-input-number__decrease').trigger('mouseup');
    expect(wrapper.emitted('change')?.[0]).toEqual([4]);
  });

  // 3. Respects min/max boundaries
  it('does not decrease below min', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 0, min: 0, step: 1 } });
    wrapper.find('.crazy-input-number__decrease').trigger('mousedown');
    wrapper.find('.crazy-input-number__decrease').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('does not increase above max', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 10, max: 10, step: 1 } });
    wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    wrapper.find('.crazy-input-number__increase').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('clamps to min boundary on increase from below', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 8, min: 10 } });
    wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    wrapper.find('.crazy-input-number__increase').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10]);
  });

  it('clamps to max boundary on decrease from above', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 12, max: 10 } });
    wrapper.find('.crazy-input-number__decrease').trigger('mousedown');
    wrapper.find('.crazy-input-number__decrease').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10]);
  });

  // 4. Step controls increment amount
  it('increments by step value', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 0, step: 5 } });
    wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    wrapper.find('.crazy-input-number__increase').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([5]);
  });

  it('decrements by step value', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 10, step: 3 } });
    wrapper.find('.crazy-input-number__decrease').trigger('mousedown');
    wrapper.find('.crazy-input-number__decrease').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([7]);
  });

  // 5. stepStrictly clamps to multiples
  it('stepStrictly clamps increased value to step multiple', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 7, step: 5, stepStrictly: true } });
    wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    wrapper.find('.crazy-input-number__increase').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10]);
  });

  it('stepStrictly clamps decreased value to step multiple', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 7, step: 5, stepStrictly: true } });
    wrapper.find('.crazy-input-number__decrease').trigger('mousedown');
    wrapper.find('.crazy-input-number__decrease').trigger('mouseup');
    // 7 - 5 = 2 -> clamp to nearest multiple of 5 -> 0
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0]);
  });

  it('stepStrictly clamps on blur', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 7, step: 5, stepStrictly: true } });
    await wrapper.find('input').trigger('focus');
    await wrapper.find('input').trigger('blur');
    // After blur, 7 is clamped to 5 (nearest multiple of 5)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([5]);
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.value).toBe('5');
  });

  // 6. Precision auto-detection from step
  it('auto-detects precision from step', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 0, step: 0.01 } });
    wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    wrapper.find('.crazy-input-number__increase').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0.01]);
  });

  it('respects explicit precision', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 0, step: 0.1, precision: 3 } });
    wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    wrapper.find('.crazy-input-number__increase').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0.100]);
  });

  // 7. controlsPosition 'right' layout
  it('renders controls-wrap when controlsPosition is right', () => {
    const wrapper = mount(InputNumber, { props: { controlsPosition: 'right' } });
    expect(wrapper.find('.crazy-input-number__controls-wrap').exists()).toBe(true);
    expect(wrapper.classes()).toContain('crazy-input-number--controls-right');
  });

  it('renders both buttons inside controls-wrap when position is right', () => {
    const wrapper = mount(InputNumber, { props: { controlsPosition: 'right' } });
    const wrap = wrapper.find('.crazy-input-number__controls-wrap');
    expect(wrap.find('.crazy-input-number__increase').exists()).toBe(true);
    expect(wrap.find('.crazy-input-number__decrease').exists()).toBe(true);
  });

  it('does not render controls-wrap when controlsPosition is around', () => {
    const wrapper = mount(InputNumber, { props: { controlsPosition: 'around' } });
    expect(wrapper.find('.crazy-input-number__controls-wrap').exists()).toBe(false);
  });

  // 8. controls=false hides buttons
  it('hides control buttons when controls is false', () => {
    const wrapper = mount(InputNumber, { props: { controls: false } });
    expect(wrapper.find('.crazy-input-number__increase').exists()).toBe(false);
    expect(wrapper.find('.crazy-input-number__decrease').exists()).toBe(false);
  });

  // 9. Disabled state
  it('applies is-disabled class when disabled', () => {
    const wrapper = mount(InputNumber, { props: { disabled: true } });
    expect(wrapper.classes()).toContain('is-disabled');
  });

  it('does not increase when disabled', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5, disabled: true } });
    wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    wrapper.find('.crazy-input-number__increase').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('does not decrease when disabled', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5, disabled: true } });
    wrapper.find('.crazy-input-number__decrease').trigger('mousedown');
    wrapper.find('.crazy-input-number__decrease').trigger('mouseup');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('sets disabled attribute on input', () => {
    const wrapper = mount(InputNumber, { props: { disabled: true } });
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
  });

  // 10. Long-press acceleration
  it('starts interval on mousedown for increase', async () => {
    vi.useFakeTimers();
    const wrapper = mount(InputNumber, { props: { modelValue: 0, step: 1 } });
    await wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    // After initial click, setInterval starts; advance by 450ms (3 * 150)
    vi.advanceTimersByTime(450);
    await wrapper.find('.crazy-input-number__increase').trigger('mouseup');
    const emitted = wrapper.emitted('update:modelValue');
    // Initial click = 1, then 3 more from interval = 4 total
    expect(emitted?.length).toBeGreaterThanOrEqual(3);
    vi.useRealTimers();
  });

  it('starts interval on mousedown for decrease', async () => {
    vi.useFakeTimers();
    const wrapper = mount(InputNumber, { props: { modelValue: 10, step: 1 } });
    await wrapper.find('.crazy-input-number__decrease').trigger('mousedown');
    vi.advanceTimersByTime(300);
    await wrapper.find('.crazy-input-number__decrease').trigger('mouseup');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted?.length).toBeGreaterThanOrEqual(2);
    vi.useRealTimers();
  });

  it('stops interval on mouseup', async () => {
    vi.useFakeTimers();
    const wrapper = mount(InputNumber, { props: { modelValue: 0, step: 1 } });
    await wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    vi.advanceTimersByTime(150);
    await wrapper.find('.crazy-input-number__increase').trigger('mouseup');
    const emittedAfterMouseup = wrapper.emitted('update:modelValue')?.length ?? 0;
    vi.advanceTimersByTime(300);
    // Should not emit more after mouseup
    const totalAfter = wrapper.emitted('update:modelValue')?.length ?? 0;
    expect(totalAfter).toBe(emittedAfterMouseup);
    vi.useRealTimers();
  });

  it('stops interval on mouseleave', async () => {
    vi.useFakeTimers();
    const wrapper = mount(InputNumber, { props: { modelValue: 0, step: 1 } });
    await wrapper.find('.crazy-input-number__increase').trigger('mousedown');
    vi.advanceTimersByTime(150);
    await wrapper.find('.crazy-input-number__increase').trigger('mouseleave');
    const emittedAfterLeave = wrapper.emitted('update:modelValue')?.length ?? 0;
    vi.advanceTimersByTime(300);
    const totalAfter = wrapper.emitted('update:modelValue')?.length ?? 0;
    expect(totalAfter).toBe(emittedAfterLeave);
    vi.useRealTimers();
  });

  // 11. Intermediate input allowed
  it('allows intermediate input "-"', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5 } });
    const input = wrapper.find('input');
    await input.setValue('-');
    expect((input.element as HTMLInputElement).value).toBe('-');
  });

  it('allows intermediate input "1."', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 1 } });
    const input = wrapper.find('input');
    await input.setValue('1.');
    expect((input.element as HTMLInputElement).value).toBe('1.');
  });

  it('allows input with leading decimal', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 1 } });
    const input = wrapper.find('input');
    await input.setValue('.5');
    expect((input.element as HTMLInputElement).value).toBe('.5');
  });

  // 12. Blur clamps invalid value
  it('clamps to min on blur when value is below min', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 3, min: 5 } });
    await wrapper.find('input').trigger('focus');
    await wrapper.find('input').trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([5]);
  });

  it('clamps to max on blur when value exceeds max', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 15, max: 10 } });
    await wrapper.find('input').trigger('focus');
    await wrapper.find('input').trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10]);
  });

  it('clamps on blur after direct input', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 10, min: 5, max: 15 } });
    const input = wrapper.find('input');
    await input.trigger('focus');
    // Simulate typing — handleInput emits updated value
    await input.setValue('20');
    // Simulate parent responding by updating modelValue
    await wrapper.setProps({ modelValue: 20 });
    // Blur should clamp 20 to 15
    await input.trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.pop()).toEqual([15]);
  });

  // 13. Size class
  it('applies size class', () => {
    const wrapper = mount(InputNumber, { props: { size: 'large' } });
    expect(wrapper.classes()).toContain('crazy-input-number--large');
  });

  it('applies medium size by default', () => {
    const wrapper = mount(InputNumber);
    expect(wrapper.classes()).toContain('crazy-input-number--medium');
  });

  // 14. Keyboard up/down arrow
  it('increases on keyboard up arrow', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5 } });
    wrapper.find('input').trigger('keydown.up');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([6]);
  });

  it('decreases on keyboard down arrow', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5 } });
    wrapper.find('input').trigger('keydown.down');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([4]);
  });

  it('does not respond to arrow keys when disabled', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5, disabled: true } });
    wrapper.find('input').trigger('keydown.up');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  // 15. Emits focus and blur
  it('emits focus event', async () => {
    const wrapper = mount(InputNumber);
    await wrapper.find('input').trigger('focus');
    expect(wrapper.emitted('focus')).toBeTruthy();
  });

  it('emits blur event', async () => {
    const wrapper = mount(InputNumber);
    await wrapper.find('input').trigger('focus');
    await wrapper.find('input').trigger('blur');
    expect(wrapper.emitted('blur')).toBeTruthy();
  });

  // 16. v-model correctly updates display
  it('updates display when modelValue changes externally', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5 } });
    await wrapper.setProps({ modelValue: 42 });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.value).toBe('42');
  });

  // 17. Controls are rendered as direct children when around
  it('renders decrease on left and increase on right for around', () => {
    const wrapper = mount(InputNumber, { props: { controlsPosition: 'around' } });
    const children = wrapper.element.children;
    const firstChild = children[0];
    const lastChild = children[children.length - 1];
    expect(firstChild.className).toContain('crazy-input-number__decrease');
    expect(lastChild.className).toContain('crazy-input-number__increase');
  });

  // 18. IME composition
  it('does not emit during composition start', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5 } });
    const input = wrapper.find('input');
    await input.trigger('compositionstart');
    await input.setValue('6');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });
});
