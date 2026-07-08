import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Empty from '../src/empty.vue';

function createEmpty(props = {}) {
  return mount(Empty, { props });
}

describe('Empty', () => {
  it('renders default empty state', () => {
    const wrapper = createEmpty();
    expect(wrapper.find('.crazy-empty').exists()).toBe(true);
    expect(wrapper.find('.crazy-empty__image').exists()).toBe(true);
  });

  it('renders default description', () => {
    const wrapper = createEmpty();
    expect(wrapper.find('.crazy-empty__description').text()).toBe('暂无数据');
  });

  it('renders custom description via prop', () => {
    const wrapper = createEmpty({ description: '没有数据' });
    expect(wrapper.find('.crazy-empty__description').text()).toBe('没有数据');
  });

  it('renders custom image via prop', () => {
    const wrapper = createEmpty({ image: '/empty.png' });
    expect(wrapper.find('.crazy-empty__img').exists()).toBe(true);
  });

  it('applies imageStyle to image container', () => {
    const wrapper = createEmpty({ imageStyle: { width: '100px' } });
    const img = wrapper.find('.crazy-empty__image');
    expect(img.attributes('style')).toContain('width: 100px');
  });

  it('renders description slot', () => {
    const wrapper = mount(Empty, {
      slots: { description: '<span class="custom-desc">自定义</span>' },
    });
    expect(wrapper.find('.custom-desc').text()).toBe('自定义');
  });

  it('renders image slot', () => {
    const wrapper = mount(Empty, {
      slots: { image: '<img class="custom-img" src="test.png" />' },
    });
    expect(wrapper.find('.custom-img').exists()).toBe(true);
  });

  it('renders default slot as extra actions', () => {
    const wrapper = mount(Empty, {
      slots: { default: '<button class="btn">重试</button>' },
    });
    expect(wrapper.find('.btn').exists()).toBe(true);
    expect(wrapper.find('.crazy-empty__extra').exists()).toBe(true);
  });
});
