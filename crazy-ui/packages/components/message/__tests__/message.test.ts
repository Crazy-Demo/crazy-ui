import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MessageComponent from '../src/message.vue';
import { Message } from '../src/message';

describe('MessageComponent', () => {
  it('renders message text', () => {
    const wrapper = mount(MessageComponent, {
      props: { message: '这是一条消息', type: 'info' },
    });
    expect(wrapper.text()).toContain('这是一条消息');
  });

  it('applies type class', () => {
    const wrapper = mount(MessageComponent, {
      props: { message: '成功', type: 'success' },
    });
    expect(wrapper.find('.crazy-message--success').exists()).toBe(true);
  });

  it('shows close button when showClose is true', () => {
    const wrapper = mount(MessageComponent, {
      props: { message: 'test', showClose: true },
    });
    expect(wrapper.find('.crazy-message__close').exists()).toBe(true);
  });

  it('applies center class', () => {
    const wrapper = mount(MessageComponent, {
      props: { message: 'test', center: true },
    });
    expect(wrapper.find('.crazy-message.is-center').exists()).toBe(true);
  });

  it('closes on close button click', async () => {
    const wrapper = mount(MessageComponent, {
      props: { message: 'test', showClose: true },
    });
    await wrapper.find('.crazy-message__close').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});

describe('Message API', () => {
  afterEach(() => {
    Message.closeAll();
  });

  it('has success method', () => {
    expect(typeof Message.success).toBe('function');
  });

  it('has error method', () => {
    expect(typeof Message.error).toBe('function');
  });

  it('has warning method', () => {
    expect(typeof Message.warning).toBe('function');
  });

  it('has info method', () => {
    expect(typeof Message.info).toBe('function');
  });

  it('has closeAll method', () => {
    expect(typeof Message.closeAll).toBe('function');
  });
});
