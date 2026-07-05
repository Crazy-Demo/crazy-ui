// packages/components/form/__tests__/form.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { defineComponent, ref, nextTick } from 'vue';
import Form from '../src/form.vue';
import FormItem from '../src/form-item.vue';
import Input from '../../input/src/input.vue';

// Polyfill ResizeObserver for jsdom
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

describe('Form', () => {
  // 1. Renders form with FormItem slots
  it('renders form with FormItem slots', () => {
    const wrapper = mount(Form, {
      props: { model: { name: '' } },
      slots: {
        default: '<FormItem label="Name" prop="name"><input /></FormItem>',
      },
      global: {
        components: { FormItem },
      },
    });
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('.crazy-form-item').exists()).toBe(true);
  });

  // 2. FormItem displays label
  it('displays label text', () => {
    const wrapper = mount(FormItem, {
      props: { label: 'Username' },
    });
    expect(wrapper.find('.crazy-form-item__label').text()).toBe('Username');
  });

  // 3. required field shows * indicator
  it('shows required indicator when rules include required', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: '' });
          const rules = { name: [{ required: true, message: 'Required' }] };
          return { model, rules };
        },
        template: `
          <Form :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    expect(wrapper.find('.crazy-form-item.is-required').exists()).toBe(true);
  });

  // 4. validateField returns valid for empty rules
  it('validates field as valid when no rules exist', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: 'hello' });
          return { model };
        },
        template: `
          <Form ref="formRef" :model="model">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const form = wrapper.findComponent(Form);
    const result = await (form.vm as any).validate();
    expect(result).toBe(true);
  });

  // 5. required rule fails for empty value
  it('required rule fails for empty value', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: '' });
          const rules = { name: [{ required: true, message: 'Name is required' }] };
          return { model, rules };
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const form = wrapper.findComponent(Form);
    const result = await (form.vm as any).validate();
    expect(result).toBe(false);
    expect(wrapper.find('.crazy-form-item__error').text()).toContain('Name is required');
  });

  // 6. required rule passes for non-empty value
  it('required rule passes for non-empty value', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: 'John' });
          const rules = { name: [{ required: true, message: 'Name is required' }] };
          return { model, rules };
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const form = wrapper.findComponent(Form);
    const result = await (form.vm as any).validate();
    expect(result).toBe(true);
  });

  // 7. min/max rules for string length
  it('min rule fails when value is too short', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: 'ab' });
          const rules = { name: [{ min: 3, message: 'At least 3 characters' }] };
          return { model, rules };
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const form = wrapper.findComponent(Form);
    const result = await (form.vm as any).validate();
    expect(result).toBe(false);
  });

  it('max rule fails when value is too long', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: 'abcdef' });
          const rules = { name: [{ max: 3, message: 'At most 3 characters' }] };
          return { model, rules };
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const form = wrapper.findComponent(Form);
    const result = await (form.vm as any).validate();
    expect(result).toBe(false);
  });

  // 8. pattern rule (regex)
  it('pattern rule validates correctly', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ email: 'invalid' });
          const rules = { email: [{ pattern: /^[a-z]+@[a-z]+\.[a-z]+$/, message: 'Invalid email' }] };
          return { model, rules };
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem label="Email" prop="email">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const form = wrapper.findComponent(Form);
    const result = await (form.vm as any).validate();
    expect(result).toBe(false);
    expect(wrapper.find('.crazy-form-item__error').text()).toContain('Invalid email');
  });

  // 9. custom validator function
  it('custom validator works correctly', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ age: 15 });
          const rules = {
            age: [
              {
                validator: (value: number) => value >= 18,
                message: 'Must be 18 or older',
              },
            ],
          };
          return { model, rules };
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem label="Age" prop="age">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const form = wrapper.findComponent(Form);
    const result = await (form.vm as any).validate();
    expect(result).toBe(false);
  });

  // 10. custom validator returns error string
  it('custom validator returns error string', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: 'test' });
          const rules = {
            name: [
              {
                validator: () => 'Custom error message',
              },
            ],
          };
          return { model, rules };
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const form = wrapper.findComponent(Form);
    const result = await (form.vm as any).validate();
    expect(result).toBe(false);
    expect(wrapper.find('.crazy-form-item__error').text()).toContain('Custom error message');
  });

  // 11. validate() checks all fields
  it('validate checks all fields', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: '', email: '' });
          const rules = {
            name: [{ required: true, message: 'Name required' }],
            email: [{ required: true, message: 'Email required' }],
          };
          return { model, rules };
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
            <FormItem label="Email" prop="email">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const form = wrapper.findComponent(Form);
    const result = await (form.vm as any).validate();
    expect(result).toBe(false);
    const errors = wrapper.findAll('.crazy-form-item__error');
    expect(errors.length).toBe(2);
  });

  // 12. clearValidate() resets all errors
  it('clearValidate resets all errors', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: '' });
          const rules = { name: [{ required: true, message: 'Name required' }] };
          return { model, rules };
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const form = wrapper.findComponent(Form);
    await (form.vm as any).validate();
    expect(wrapper.find('.crazy-form-item__error').exists()).toBe(true);

    (form.vm as any).clearValidate();
    await nextTick();
    expect(wrapper.find('.crazy-form-item__error').exists()).toBe(false);
  });

  // 13. Form exposes validate/clearValidate/resetFields via defineExpose
  it('exposes validate, clearValidate, resetFields', () => {
    const wrapper = mount(Form, {
      props: { model: { name: '' } },
    });
    const vm = wrapper.vm as any;
    expect(typeof vm.validate).toBe('function');
    expect(typeof vm.clearValidate).toBe('function');
    expect(typeof vm.resetFields).toBe('function');
  });

  // 14. Input inside FormItem triggers validation on change
  it('triggers validation on input change event', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: '' });
          const rules = { name: [{ required: true, message: 'Name required', trigger: 'change' }] };
          return { model, rules };
        },
        template: `
          <Form :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <Input v-model="model.name" />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem, Input },
      }),
    );

    const input = wrapper.find('input');
    // Set a value to trigger change validation
    await input.setValue('');
    await input.trigger('change');
    // Wait for async validation
    await nextTick();
    await nextTick();

    // With empty value and required rule, change should trigger the validation
    // Input's handleChange calls formItem?.validate('change')
    // which checks if any rule matches 'change' trigger
    // Required rule without explicit trigger defaults to 'change'
    expect(wrapper.find('.crazy-form-item__error').exists()).toBe(true);
  });

  // 15. Error message displays below field
  it('displays error message below field', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: '' });
          const rules = { name: [{ required: true, message: 'This field is required' }] };
          return { model, rules };
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const form = wrapper.findComponent(Form);
    await (form.vm as any).validate();
    const errorEl = wrapper.find('.crazy-form-item__error');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toBe('This field is required');
    expect(errorEl.attributes('role')).toBe('alert');
  });

  // 16. inline mode class
  it('adds is-inline class when inline prop is true', () => {
    const wrapper = mount(Form, {
      props: { model: { name: '' }, inline: true },
    });
    expect(wrapper.find('form').classes()).toContain('is-inline');
  });

  // 17. labelPosition/labelWidth styles
  it('applies label width from form', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: '' });
          return { model };
        },
        template: `
          <Form :model="model" labelWidth="120px">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
      }),
    );
    const label = wrapper.find('.crazy-form-item__label');
    expect(label.attributes('style')).toContain('120px');
  });

  // 18. submit event only fires when all valid
  it('emits submit only when all fields are valid', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: 'John', email: 'john@test.com' });
          const rules = {
            name: [{ required: true }],
            email: [{ pattern: /^.+@.+$/, message: 'Invalid email' }],
          };
          return { model, rules };
        },
        template: `
          <Form :model="model" :rules="rules" @submit="onSubmit">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
            <FormItem label="Email" prop="email">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
        methods: {
          onSubmit() { /* emit handled by Form */ },
        },
      }),
    );

    const form = wrapper.find('form');
    await form.trigger('submit');
    // Submit should fire because all fields are valid
    const formComponent = wrapper.findComponent(Form);
    const emitted = formComponent.emitted('submit');
    expect(emitted).toBeTruthy();
  });

  it('does not emit submit when validation fails', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: '' });
          const rules = { name: [{ required: true, message: 'Required' }] };
          return { model, rules };
        },
        template: `
          <Form :model="model" :rules="rules" @submit="onSubmit">
            <FormItem label="Name" prop="name">
              <input />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem },
        methods: {
          onSubmit() { /* emit handled by Form */ },
        },
      }),
    );

    const form = wrapper.find('form');
    await form.trigger('submit');
    const formComponent = wrapper.findComponent(Form);
    const emitted = formComponent.emitted('submit');
    expect(emitted).toBeFalsy();
  });
});

describe('Form with Input', () => {
  // Validates Input on blur inside Form
  it('validates Input on blur inside Form', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: '' });
          const rules = { name: [{ required: true, message: 'Name required', trigger: 'blur' }] };
          return { model, rules };
        },
        template: `
          <Form :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <Input v-model="model.name" />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem, Input },
      }),
    );

    const input = wrapper.find('input');
    await input.trigger('focus');
    await input.trigger('blur');
    await nextTick();
    await nextTick();

    expect(wrapper.find('.crazy-form-item__error').text()).toContain('Name required');
  });

  // Validates Input on change inside Form
  it('validates Input on change inside Form', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref({ name: 'a' });
          const rules = { name: [{ min: 3, message: 'At least 3 chars', trigger: 'change' }] };
          return { model, rules };
        },
        template: `
          <Form :model="model" :rules="rules">
            <FormItem label="Name" prop="name">
              <Input v-model="model.name" />
            </FormItem>
          </Form>
        `,
        components: { Form, FormItem, Input },
      }),
    );

    const input = wrapper.find('input');
    await input.setValue('ab');
    await input.trigger('change');
    await nextTick();
    await nextTick();

    expect(wrapper.find('.crazy-form-item__error').text()).toContain('At least 3 chars');
  });
});
