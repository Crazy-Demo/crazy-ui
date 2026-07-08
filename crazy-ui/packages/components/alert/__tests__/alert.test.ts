import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Alert from '../src/alert.vue';

function createAlert(props = {}) {
  return mount(Alert, { props });
}

function getAlert(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('.crazy-alert');
}

describe('Alert', () => {
  it('renders info type by default', () => {
    const wrapper = createAlert();
    expect(getAlert(wrapper).exists()).toBe(true);
    expect(getAlert(wrapper).classes()).toContain('crazy-alert--info');
  });

  it('renders title', () => {
    const wrapper = createAlert({ title: '提示标题' });
    expect(wrapper.find('.crazy-alert__title').text()).toBe('提示标题');
  });

  it('renders description', () => {
    const wrapper = createAlert({ description: '这是一条提示信息' });
    expect(wrapper.find('.crazy-alert__description').text()).toBe('这是一条提示信息');
  });

  it('renders success type', () => {
    const wrapper = createAlert({ type: 'success' });
    expect(getAlert(wrapper).classes()).toContain('crazy-alert--success');
  });

  it('renders error type', () => {
    const wrapper = createAlert({ type: 'error' });
    expect(getAlert(wrapper).classes()).toContain('crazy-alert--error');
  });

  it('renders warning type', () => {
    const wrapper = createAlert({ type: 'warning' });
    expect(getAlert(wrapper).classes()).toContain('crazy-alert--warning');
  });

  it('shows close button by default', () => {
    const wrapper = createAlert();
    expect(wrapper.find('.crazy-alert__close').exists()).toBe(true);
  });

  it('hides close button when closable is false', () => {
    const wrapper = createAlert({ closable: false });
    expect(wrapper.find('.crazy-alert__close').exists()).toBe(false);
  });

  it('emits close event when close button clicked', async () => {
    const wrapper = createAlert();
    await wrapper.find('.crazy-alert__close').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('hides after close', async () => {
    const wrapper = createAlert();
    await wrapper.find('.crazy-alert__close').trigger('click');
    expect(getAlert(wrapper).exists()).toBe(false);
  });

  it('shows icon when showIcon is true', () => {
    const wrapper = createAlert({ showIcon: true });
    expect(wrapper.find('.crazy-alert__icon').exists()).toBe(true);
  });

  it('hides icon by default', () => {
    const wrapper = createAlert();
    expect(wrapper.find('.crazy-alert__icon').exists()).toBe(false);
  });

  it('applies center class', () => {
    const wrapper = createAlert({ center: true });
    expect(getAlert(wrapper).classes()).toContain('is-center');
  });

  it('applies dark effect class', () => {
    const wrapper = createAlert({ effect: 'dark' });
    expect(getAlert(wrapper).classes()).toContain('crazy-alert--dark');
  });

  it('has alert role for accessibility', () => {
    const wrapper = createAlert();
    expect(getAlert(wrapper).attributes('role')).toBe('alert');
  });
});
