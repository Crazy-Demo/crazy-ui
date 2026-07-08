import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Layout from '../src/layout.vue';
import Header from '../src/header.vue';
import Footer from '../src/footer.vue';
import Sider from '../src/sider.vue';
import Content from '../src/content.vue';
import { h } from 'vue';

describe('Layout', () => {
  it('renders section element', () => {
    const wrapper = mount(Layout);
    expect(wrapper.element.tagName).toBe('SECTION');
  });

  it('renders slot content', () => {
    const wrapper = mount(Layout, {
      slots: { default: '<div class="child">child</div>' },
    });
    expect(wrapper.find('.child').exists()).toBe(true);
  });

  it('renders with sider and content', () => {
    const wrapper = mount(Layout, {
      slots: {
        default: () => [h(Sider, {}, () => 'sider'), h(Content, {}, () => 'content')],
      },
    });
    expect(wrapper.find('.crazy-layout-sider').exists()).toBe(true);
    expect(wrapper.find('.crazy-layout-content').exists()).toBe(true);
  });
});

describe('Header', () => {
  it('renders header element', () => {
    const wrapper = mount(Header);
    expect(wrapper.element.tagName).toBe('HEADER');
  });

  it('defaults height to 60px', () => {
    const wrapper = mount(Header);
    expect((wrapper.element as HTMLElement).style.height).toBe('60px');
  });

  it('applies custom height', () => {
    const wrapper = mount(Header, { props: { height: '80px' } });
    expect((wrapper.element as HTMLElement).style.height).toBe('80px');
  });
});

describe('Footer', () => {
  it('renders footer element', () => {
    const wrapper = mount(Footer);
    expect(wrapper.element.tagName).toBe('FOOTER');
  });

  it('defaults height to 60px', () => {
    const wrapper = mount(Footer);
    expect((wrapper.element as HTMLElement).style.height).toBe('60px');
  });
});

describe('Sider', () => {
  it('renders aside element', () => {
    const wrapper = mount(Sider);
    expect(wrapper.element.tagName).toBe('ASIDE');
  });

  it('defaults width to 200px', () => {
    const wrapper = mount(Sider);
    expect((wrapper.element as HTMLElement).style.width).toBe('200px');
  });

  it('applies custom width', () => {
    const wrapper = mount(Sider, { props: { width: '300px' } });
    expect((wrapper.element as HTMLElement).style.width).toBe('300px');
  });

  it('accepts numeric width', () => {
    const wrapper = mount(Sider, { props: { width: 250 } });
    expect((wrapper.element as HTMLElement).style.width).toBe('250px');
  });

  it('shows trigger when collapsible', () => {
    const wrapper = mount(Sider, { props: { collapsible: true } });
    expect(wrapper.find('.crazy-layout-sider__trigger').exists()).toBe(true);
  });

  it('hides trigger by default', () => {
    const wrapper = mount(Sider);
    expect(wrapper.find('.crazy-layout-sider__trigger').exists()).toBe(false);
  });

  it('emits update:collapsed on trigger click', async () => {
    const wrapper = mount(Sider, { props: { collapsible: true } });
    await wrapper.find('.crazy-layout-sider__trigger').trigger('click');
    expect(wrapper.emitted('update:collapsed')?.[0]).toEqual([true]);
  });

  it('toggles collapsed state', async () => {
    const wrapper = mount(Sider, { props: { collapsible: true } });
    expect(wrapper.classes()).not.toContain('is-collapsed');
    await wrapper.find('.crazy-layout-sider__trigger').trigger('click');
    expect(wrapper.classes()).toContain('is-collapsed');
  });
});

describe('Content', () => {
  it('renders main element', () => {
    const wrapper = mount(Content);
    expect(wrapper.element.tagName).toBe('MAIN');
  });
});
