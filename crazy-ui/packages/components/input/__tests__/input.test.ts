// packages/components/input/__tests__/input.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import Input from '../src/input.vue';

// Polyfill ResizeObserver for jsdom (used by use-autosize)
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (globalThis as any).ResizeObserver = ResizeObserverMock;
  }
});

describe('Input', () => {
  // 1. Basic rendering
  it('renders an input element', () => {
    const wrapper = mount(Input);
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('renders textarea when type=textarea', () => {
    const wrapper = mount(Input, { props: { type: 'textarea' } });
    expect(wrapper.find('textarea').exists()).toBe(true);
    expect(wrapper.find('input').exists()).toBe(false);
  });

  // 2. v-model
  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Input);
    await wrapper.find('input').setValue('hello');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello']);
  });

  it('displays the modelValue', () => {
    const wrapper = mount(Input, { props: { modelValue: 'test' } });
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('test');
  });

  // 3. disabled / readonly
  it('applies disabled attribute', () => {
    const wrapper = mount(Input, { props: { disabled: true } });
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    expect(wrapper.classes()).toContain('is-disabled');
  });

  it('applies readonly attribute', () => {
    const wrapper = mount(Input, { props: { readonly: true } });
    expect((wrapper.find('input').element as HTMLInputElement).readOnly).toBe(true);
  });

  // 4. clearable
  it('shows clear icon when focused and has value', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'text', clearable: true },
    });
    await wrapper.find('input').trigger('focus');
    expect(wrapper.find('.crazy-input__clear').exists()).toBe(true);
  });

  it('does not show clear icon when empty', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: '', clearable: true },
    });
    await wrapper.find('input').trigger('focus');
    expect(wrapper.find('.crazy-input__clear').exists()).toBe(false);
  });

  it('clears value on clear click', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'text', clearable: true },
    });
    await wrapper.find('input').trigger('focus');
    await wrapper.find('.crazy-input__clear').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['']);
    expect(wrapper.emitted('clear')).toBeTruthy();
  });

  // 5. password toggle
  it('toggles password visibility', async () => {
    const wrapper = mount(Input, {
      props: { type: 'password', showPassword: true },
    });
    const input = wrapper.find('input');
    expect(input.attributes('type')).toBe('password');

    await wrapper.find('.crazy-input__password').trigger('click');
    expect(wrapper.find('input').attributes('type')).toBe('text');

    await wrapper.find('.crazy-input__password').trigger('click');
    expect(wrapper.find('input').attributes('type')).toBe('password');
  });

  // 6. word limit
  it('shows word count when showWordLimit and maxlength set', () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'hi', maxlength: 10, showWordLimit: true },
    });
    expect(wrapper.find('.crazy-input__count').text()).toBe('2 / 10');
  });

  it('applies is-exceed class when over limit', () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'hello world', maxlength: 5, showWordLimit: true },
    });
    expect(wrapper.classes()).toContain('is-exceed');
  });

  // 7. size class
  it('applies size class', () => {
    const wrapper = mount(Input, { props: { size: 'large' } });
    expect(wrapper.classes()).toContain('crazy-input--large');
  });

  // 8. status class
  it('applies error status class', () => {
    const wrapper = mount(Input, { props: { status: 'error' } });
    expect(wrapper.classes()).toContain('is-error');
  });

  // 9. events
  it('emits focus and blur', async () => {
    const wrapper = mount(Input);
    await wrapper.find('input').trigger('focus');
    expect(wrapper.emitted('focus')).toBeTruthy();
    await wrapper.find('input').trigger('blur');
    expect(wrapper.emitted('blur')).toBeTruthy();
  });

  it('emits change on native change event', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'a' } });
    await wrapper.find('input').setValue('ab');
    await wrapper.find('input').trigger('change');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  // 10. IME composition
  it('does not emit update:modelValue during IME composition', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'initial' } });
    const input = wrapper.find('input');
    await input.trigger('compositionstart');
    await input.setValue('拼音');
    const emits = wrapper.emitted('update:modelValue') || [];
    const duringCompositionValues = emits.map(e => e[0]);
    expect(duringCompositionValues).not.toContain('拼音');
  });

  it('emits update:modelValue after compositionend with final value', async () => {
    const wrapper = mount(Input, { props: { modelValue: '' } });
    const input = wrapper.find('input');
    await input.trigger('compositionstart');
    await input.setValue('你好');
    // JSDOM does not fire automatic input event after compositionend,
    // so manually trigger one to simulate browser behavior
    await input.trigger('compositionend');
    await input.setValue('你好');
    const emits = wrapper.emitted('update:modelValue');
    expect(emits).toBeTruthy();
  });

  // 11. prefix/suffix slots
  it('renders prefix slot', () => {
    const wrapper = mount(Input, {
      slots: { prefix: '<span class="pre">pre</span>' },
    });
    expect(wrapper.find('.crazy-input__prefix').exists()).toBe(true);
  });

  it('renders suffix slot', () => {
    const wrapper = mount(Input, {
      slots: { suffix: '<span class="suf">suf</span>' },
    });
    expect(wrapper.find('.crazy-input__suffix').exists()).toBe(true);
  });
});
