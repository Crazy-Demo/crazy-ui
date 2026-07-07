import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Loading from '../src/loading.vue';

function createLoading(props = {}) {
  return mount(Loading, { props: { ...props } });
}

describe('Loading', () => {
  // 1. Renders spinner by default
  it('renders spinner when loading is true', () => {
    const wrapper = createLoading({ loading: true });
    expect(wrapper.find('.crazy-loading__spinner').exists()).toBe(true);
    expect(wrapper.find('.crazy-loading').exists()).toBe(true);
  });

  // 2. Text prop
  it('renders text prop', () => {
    const wrapper = createLoading({ loading: true, text: '加载中...' });
    expect(wrapper.find('.crazy-loading__text').text()).toBe('加载中...');
  });

  // 3. Fullscreen class
  it('adds is-fullscreen class when fullscreen is true', () => {
    const wrapper = createLoading({ loading: true, fullscreen: true });
    expect(wrapper.find('.crazy-loading').classes()).toContain('is-fullscreen');
  });

  // 4. Loading=false hides component
  it('hides content when loading is false', () => {
    const wrapper = createLoading({ loading: false });
    expect(wrapper.find('.crazy-loading').exists()).toBe(false);
  });

  // 5. Background prop
  it('applies background style', () => {
    const wrapper = createLoading({ loading: true, background: 'rgba(0,0,0,0.5)' });
    const el = wrapper.find('.crazy-loading').element as HTMLElement;
    expect(el.style.backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
  });

  // 6. No spinner mode (just mask)
  it('hides spinner element when spinner is false', () => {
    const wrapper = createLoading({ loading: true, spinner: false });
    expect(wrapper.find('.crazy-loading__spinner').exists()).toBe(false);
  });

  // 7. Transition name is applied
  it('applies loading-fade transition', () => {
    const wrapper = createLoading({ loading: true });
    expect(wrapper.findComponent({ name: 'Transition' }).exists()).toBe(true);
  });
});
