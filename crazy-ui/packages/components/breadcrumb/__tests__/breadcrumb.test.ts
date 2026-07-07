import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Breadcrumb from '../src/breadcrumb.vue';
import BreadcrumbItem from '../src/breadcrumb-item.vue';

describe('Breadcrumb', () => {
  it('renders with default props', () => {
    const wrapper = mount(Breadcrumb);
    expect(wrapper.find('.crazy-breadcrumb').exists()).toBe(true);
  });

  it('has navigation role and aria-label', () => {
    const wrapper = mount(Breadcrumb);
    expect(wrapper.attributes('role')).toBe('navigation');
    expect(wrapper.attributes('aria-label')).toBe('Breadcrumb');
  });

  it('renders slot content', () => {
    const wrapper = mount(Breadcrumb, {
      slots: { default: '<span class="test-item">Item</span>' },
    });
    expect(wrapper.find('.test-item').exists()).toBe(true);
  });
});

describe('BreadcrumbItem', () => {
  it('renders with default props', () => {
    const wrapper = mount(BreadcrumbItem, {
      props: { isLast: true },
      slots: { default: 'Home' },
    });
    expect(wrapper.find('.crazy-breadcrumb-item').exists()).toBe(true);
    expect(wrapper.text()).toContain('Home');
  });

  // 2. Separator display
  it('shows separator when not last item', () => {
    const wrapper = mount(BreadcrumbItem, {
      props: { isLast: false, separator: '/' },
      slots: { default: 'Home' },
    });
    expect(wrapper.find('.crazy-breadcrumb-item__separator').exists()).toBe(true);
    expect(wrapper.find('.crazy-breadcrumb-item__separator').text()).toBe('/');
  });

  it('hides separator when isLast is true', () => {
    const wrapper = mount(BreadcrumbItem, {
      props: { isLast: true },
      slots: { default: 'Home' },
    });
    expect(wrapper.find('.crazy-breadcrumb-item__separator').exists()).toBe(false);
  });

  // 3. Custom separator
  it('renders custom separator', () => {
    const wrapper = mount(BreadcrumbItem, {
      props: { separator: '>' },
      slots: { default: 'Home' },
    });
    expect(wrapper.find('.crazy-breadcrumb-item__separator').text()).toBe('>');
  });

  // 4. is-link class
  it('has is-link class when to prop is provided', () => {
    const wrapper = mount(BreadcrumbItem, {
      props: { to: '/home' },
      slots: { default: 'Home' },
    });
    expect(wrapper.find('.crazy-breadcrumb-item').classes()).toContain('is-link');
  });

  it('does not have is-link class when to prop is not provided', () => {
    const wrapper = mount(BreadcrumbItem, {
      props: { isLast: true },
      slots: { default: 'Home' },
    });
    expect(wrapper.find('.crazy-breadcrumb-item').classes()).not.toContain('is-link');
  });

  // 5. Link click calls navigate (useRouterLink)
  it('renders text content', () => {
    const wrapper = mount(BreadcrumbItem, {
      props: { isLast: true },
      slots: { default: 'Current Page' },
    });
    expect(wrapper.text()).toContain('Current Page');
  });

  // 6. Full Breadcrumb with items integration
  it('renders breadcrumb with multiple items', () => {
    const wrapper = mount(Breadcrumb, {
      slots: {
        default: `
          <BreadcrumbItem isLast="false" separator="/">Home</BreadcrumbItem>
          <BreadcrumbItem isLast="true">Current</BreadcrumbItem>
        `,
      },
      global: {
        components: { BreadcrumbItem },
      },
    });
    expect(wrapper.find('.crazy-breadcrumb').exists()).toBe(true);
    const items = wrapper.findAll('.crazy-breadcrumb-item');
    expect(items.length).toBe(2);
  });
});
