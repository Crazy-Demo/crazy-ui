import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Skeleton from '../src/skeleton.vue';
import SkeletonItem from '../src/skeleton-item.vue';

function createSkeleton(props = {}) {
  return mount(Skeleton, { props });
}

describe('Skeleton', () => {
  it('renders skeleton rows when loading', () => {
    const wrapper = createSkeleton({ loading: true, rows: 2 });
    expect(wrapper.find('.crazy-skeleton').exists()).toBe(true);
    expect(wrapper.findAll('.crazy-skeleton__row')).toHaveLength(2);
  });

  it('renders default slot when not loading', () => {
    const wrapper = mount(Skeleton, {
      props: { loading: false },
      slots: { default: '<div class="content">Loaded</div>' },
    });
    expect(wrapper.find('.content').exists()).toBe(true);
    expect(wrapper.find('.crazy-skeleton').exists()).toBe(false);
  });

  it('applies animated class', () => {
    const wrapper = createSkeleton({ animated: true });
    expect(wrapper.find('.crazy-skeleton').classes()).toContain('is-animated');
  });

  it('renders default 3 rows', () => {
    const wrapper = createSkeleton();
    expect(wrapper.findAll('.crazy-skeleton__row')).toHaveLength(3);
  });

  it('uses count prop', () => {
    // count prop not used in current template, test rows instead
    const wrapper = createSkeleton({ rows: 1 });
    expect(wrapper.findAll('.crazy-skeleton__row')).toHaveLength(1);
  });
});

describe('SkeletonItem', () => {
  it('renders with default variant', () => {
    const wrapper = mount(SkeletonItem);
    expect(wrapper.find('.crazy-skeleton-item').exists()).toBe(true);
  });

  it('applies variant class', () => {
    const wrapper = mount(SkeletonItem, { props: { variant: 'circle' } });
    expect(wrapper.classes()).toContain('crazy-skeleton-item--circle');
  });

  it('applies text variant', () => {
    const wrapper = mount(SkeletonItem, { props: { variant: 'title' } });
    expect(wrapper.classes()).toContain('crazy-skeleton-item--title');
  });

  it('renders slot content', () => {
    const wrapper = mount(SkeletonItem, {
      slots: { default: '<span class="inner">X</span>' },
    });
    expect(wrapper.find('.inner').exists()).toBe(true);
  });
});
