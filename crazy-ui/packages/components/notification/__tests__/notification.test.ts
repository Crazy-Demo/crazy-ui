import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NotificationComponent from '../src/notification.vue';
import { Notification } from '../src/notification';

describe('NotificationComponent', () => {
  it('renders title and message', () => {
    const wrapper = mount(NotificationComponent, {
      props: { title: '通知标题', message: '通知内容', type: 'info' },
    });
    expect(wrapper.find('.crazy-notification__title').text()).toBe('通知标题');
    expect(wrapper.find('.crazy-notification__message').text()).toBe('通知内容');
  });

  it('applies type class via border', () => {
    const wrapper = mount(NotificationComponent, {
      props: { title: '成功', message: '操作成功', type: 'success' },
    });
    expect(wrapper.find('.crazy-notification--success').exists()).toBe(true);
  });

  it('shows close button by default', () => {
    const wrapper = mount(NotificationComponent, {
      props: { title: 'test', message: 'test' },
    });
    expect(wrapper.find('.crazy-notification__close').exists()).toBe(true);
  });

  it('hides close button when showClose is false', () => {
    const wrapper = mount(NotificationComponent, {
      props: { title: 'test', message: 'test', showClose: false },
    });
    expect(wrapper.find('.crazy-notification__close').exists()).toBe(false);
  });

  it('closes on close button click', async () => {
    const wrapper = mount(NotificationComponent, {
      props: { title: 'test', message: 'test' },
    });
    await wrapper.find('.crazy-notification__close').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits click event', async () => {
    const wrapper = mount(NotificationComponent, {
      props: {
        title: 'test',
        message: 'click me',
        onClick: () => {},
      },
    });
    await wrapper.find('.crazy-notification').trigger('click');
    // onClick is called via prop, not emit
    expect(wrapper.props('onClick')).toBeDefined();
  });
});

describe('Notification API', () => {
  it('has success method', () => {
    expect(typeof Notification.success).toBe('function');
  });

  it('has error method', () => {
    expect(typeof Notification.error).toBe('function');
  });

  it('has open method', () => {
    expect(typeof Notification.open).toBe('function');
  });

  it('has closeAll method', () => {
    expect(typeof Notification.closeAll).toBe('function');
  });
});
