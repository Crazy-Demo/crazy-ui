import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Rate from '../src/rate.vue';

function createRate(props = {}) {
  return mount(Rate, {
    props: { modelValue: 0, ...props },
  });
}

describe('Rate', () => {
  // 1. renders correct number of stars
  it('renders max stars', () => {
    const wrapper = createRate({ max: 5 });
    const items = wrapper.findAll('.crazy-rate__item');
    expect(items).toHaveLength(5);
  });

  it('renders custom max stars', () => {
    const wrapper = createRate({ max: 7 });
    const items = wrapper.findAll('.crazy-rate__item');
    expect(items).toHaveLength(7);
  });

  // 2. modelValue controls active stars
  it('activates stars based on modelValue', () => {
    const wrapper = createRate({ modelValue: 3 });
    const items = wrapper.findAll('.crazy-rate__item');
    expect(items[0].classes()).toContain('is-active');
    expect(items[1].classes()).toContain('is-active');
    expect(items[2].classes()).toContain('is-active');
    expect(items[3].classes()).not.toContain('is-active');
  });

  // 3. click emits update:modelValue and change
  it('emits modelValue on click', async () => {
    const wrapper = createRate({ modelValue: 0 });
    const items = wrapper.findAll('.crazy-rate__item');
    await items[2].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3]);
    expect(wrapper.emitted('change')?.[0]).toEqual([3]);
  });

  // 4. clicking same value clears it
  it('clears value when clicking same star', async () => {
    const wrapper = createRate({ modelValue: 3 });
    const items = wrapper.findAll('.crazy-rate__item');
    await items[2].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0]);
  });

  // 5. half-star support
  it('supports allowHalf with half star display', async () => {
    const wrapper = createRate({ modelValue: 2.5, allowHalf: true });
    const items = wrapper.findAll('.crazy-rate__item');

    // Items 0-1 should be fully active, item 2 should be half-active
    expect(items[0].classes()).toContain('is-active');
    expect(items[0].classes()).not.toContain('is-half');
    expect(items[1].classes()).toContain('is-active');
    expect(items[1].classes()).not.toContain('is-half');
    expect(items[2].classes()).toContain('is-half');
    expect(items[3].classes()).not.toContain('is-active');
  });

  // 6. disabled prevents interaction
  it('disables interaction when disabled is true', async () => {
    const wrapper = createRate({ modelValue: 2, disabled: true });
    const items = wrapper.findAll('.crazy-rate__item');
    await items[3].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  // 7. readonly prevents interaction
  it('prevents interaction when readonly', async () => {
    const wrapper = createRate({ modelValue: 2, readonly: true });
    const items = wrapper.findAll('.crazy-rate__item');
    await items[3].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  // 8. size class
  it('applies size class', () => {
    const wrapper = createRate({ size: 'large' });
    expect(wrapper.classes()).toContain('crazy-rate--large');
  });

  it('defaults to medium size', () => {
    const wrapper = createRate();
    expect(wrapper.classes()).toContain('crazy-rate--medium');
  });

  // 9. showText renders text
  it('renders text when showText is true', () => {
    const wrapper = createRate({ modelValue: 3, showText: true });
    const text = wrapper.find('.crazy-rate__text');
    expect(text.text()).toBe('一般');
  });

  it('shows empty string for zero value with showText', () => {
    const wrapper = createRate({ modelValue: 0, showText: true });
    const text = wrapper.find('.crazy-rate__text');
    expect(text.text()).toBe('');
  });

  // 10. custom texts
  it('uses custom texts array', () => {
    const wrapper = createRate({
      modelValue: 2,
      showText: true,
      texts: ['bad', 'poor', 'ok', 'good', 'great'],
    });
    const text = wrapper.find('.crazy-rate__text');
    expect(text.text()).toBe('poor');
  });

  // 11. showScore
  it('renders score template when showScore is true', () => {
    const wrapper = createRate({ modelValue: 3.5, showScore: true });
    const text = wrapper.find('.crazy-rate__text');
    expect(text.text()).toBe('3.5');
  });

  // 12. custom color
  it('applies custom color to active stars', () => {
    const wrapper = createRate({ modelValue: 3, color: '#ff0000' });
    const activeItem = wrapper.find('.crazy-rate__item.is-active');
    expect(activeItem.attributes('style')).toContain('color: rgb(255, 0, 0)');
  });

  // 13. disabled state styles
  it('applies disabled class', () => {
    const wrapper = createRate({ disabled: true });
    expect(wrapper.classes()).toContain('is-disabled');
  });

  // 14. ARIA attributes
  it('has correct ARIA attributes', () => {
    const wrapper = createRate();
    const container = wrapper.find('.crazy-rate');
    expect(container.attributes('role')).toBe('radiogroup');
    expect(container.attributes('aria-label')).toBe('rating');

    const items = wrapper.findAll('.crazy-rate__item');
    expect(items[0].attributes('role')).toBe('radio');
    expect(items[0].attributes('aria-checked')).toBe('false');
  });

  it('sets aria-disabled when disabled', () => {
    const wrapper = createRate({ disabled: true });
    expect(wrapper.attributes('aria-disabled')).toBe('true');
  });

  // 15. keyboard navigation
  it('supports ArrowRight keyboard navigation', async () => {
    const wrapper = createRate({ modelValue: 0 });
    const items = wrapper.findAll('.crazy-rate__item');
    await items[0].trigger('keydown', { key: 'ArrowRight' });
    await items[0].trigger('keydown', { key: 'ArrowRight' });
    const calls = wrapper.emitted('update:modelValue');
    expect(calls).toBeDefined();
  });

  // 16. hover interaction (non-disabled)
  it('has hover class on mouseenter', async () => {
    const wrapper = createRate({ modelValue: 0 });
    const items = wrapper.findAll('.crazy-rate__item');
    await items[2].trigger('mouseenter');
    // Items up to and including index 2 should be active
    expect(items[0].classes()).toContain('is-active');
    expect(items[1].classes()).toContain('is-active');
    expect(items[2].classes()).toContain('is-active');
    expect(items[3].classes()).not.toContain('is-active');
  });
});
