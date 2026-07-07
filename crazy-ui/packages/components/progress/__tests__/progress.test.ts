import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Progress from '../src/progress.vue';

function createProgress(props = {}) {
  return mount(Progress, { props });
}

describe('Progress', () => {
  // 1. renders percentage text
  it('renders percentage text', () => {
    const wrapper = createProgress({ percentage: 66 });
    expect(wrapper.text()).toContain('66%');
  });

  // 2. renders aria attributes
  it('renders aria attributes', () => {
    const wrapper = createProgress({ percentage: 42 });
    const bar = wrapper.find('.crazy-progress__bar');
    expect(bar.attributes('role')).toBe('progressbar');
    expect(bar.attributes('aria-valuenow')).toBe('42');
    expect(bar.attributes('aria-valuemin')).toBe('0');
    expect(bar.attributes('aria-valuemax')).toBe('100');
  });

  // 3. custom color prop
  it('applies custom color', () => {
    const wrapper = createProgress({ percentage: 50, color: '#ff6600' });
    const inner = wrapper.find('.crazy-progress__inner');
    expect(inner.attributes('style')).toContain('background-color: rgb(255, 102, 0)');
  });

  // 4. status renders icon and color
  it('renders success status icon', () => {
    const wrapper = createProgress({ percentage: 100, status: 'success' });
    expect(wrapper.text()).toContain('✓');
  });

  it('renders exception status icon', () => {
    const wrapper = createProgress({ percentage: 30, status: 'exception' });
    expect(wrapper.text()).toContain('✕');
  });

  // 5. showText false hides text
  it('hides text when showText is false', () => {
    const wrapper = createProgress({ percentage: 80, showText: false });
    expect(wrapper.find('.crazy-progress__text').exists()).toBe(false);
  });

  // 6. strokeWidth prop
  it('applies strokeWidth', () => {
    const wrapper = createProgress({ percentage: 50, strokeWidth: 10 });
    const inner = wrapper.find('.crazy-progress__inner');
    expect(inner.attributes('style')).toContain('height: 10px');
  });

  // 7. Clamps percentage between 0 and 100
  it('clamps percentage to 0-100 range', () => {
    const over = createProgress({ percentage: 150 });
    const innerOver = over.find('.crazy-progress__inner');
    expect(innerOver.attributes('style')).toContain('width: 100%');

    const under = createProgress({ percentage: -10 });
    const innerUnder = under.find('.crazy-progress__inner');
    expect(innerUnder.attributes('style')).toContain('width: 0%');
  });

  // 8. Defaults to primary color when no color or status
  it('uses default CSS custom property for color', () => {
    const wrapper = createProgress({ percentage: 50 });
    const inner = wrapper.find('.crazy-progress__inner');
    // CSS custom property var(--color-primary) is used as fallback
    expect(inner.attributes('style')).toContain('var(--color-primary)');
  });
});
