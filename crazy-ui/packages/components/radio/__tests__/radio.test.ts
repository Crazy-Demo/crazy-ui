/**
 * Radio + RadioGroup + RadioButton Tests
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Radio from '../src/radio.vue';
import RadioGroup from '../src/radio-group.vue';
import RadioButton from '../src/radio-button.vue';

describe('Radio', () => {
  // 1. Basic rendering
  it('renders correctly with slot', () => {
    const wrapper = mount(Radio, {
      slots: { default: 'Option A' },
    });
    expect(wrapper.text()).toBe('Option A');
    expect(wrapper.find('input[type="radio"]').exists()).toBe(true);
    expect(wrapper.classes()).toContain('crazy-radio');
  });

  it('renders label from prop', () => {
    const wrapper = mount(Radio, { props: { label: 'Label text' } });
    expect(wrapper.text()).toBe('Label text');
  });

  // 2. Hidden native input
  it('has hidden native input', () => {
    const wrapper = mount(Radio);
    const input = wrapper.find('input[type="radio"]');
    expect(input.classes()).toContain('crazy-radio__original');
  });

  // 3. Checked state via modelValue matching label
  it('sets is-checked class when modelValue matches label', () => {
    const wrapper = mount(Radio, {
      props: { modelValue: 'A', label: 'A' },
    });
    expect(wrapper.classes()).toContain('is-checked');
    expect(wrapper.find('input').attributes('aria-checked')).toBe('true');
  });

  it('does not set is-checked when modelValue differs from label', () => {
    const wrapper = mount(Radio, {
      props: { modelValue: 'B', label: 'A' },
    });
    expect(wrapper.classes()).not.toContain('is-checked');
    expect(wrapper.find('input').attributes('aria-checked')).toBe('false');
  });

  // 4. v-model behavior
  it('emits update:modelValue with label on change', async () => {
    const wrapper = mount(Radio, {
      props: { label: 'A' },
    });
    await wrapper.find('input').setValue(true);
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['A']);
  });

  it('emits change event on change', async () => {
    const wrapper = mount(Radio, {
      props: { label: 'A' },
    });
    await wrapper.find('input').setValue(true);
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')?.[0]).toEqual(['A']);
  });

  // 5. disabled state
  it('applies disabled state', () => {
    const wrapper = mount(Radio, {
      props: { disabled: true },
    });
    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    expect(wrapper.find('input').attributes('aria-disabled')).toBe('true');
  });

  it('does not emit change when disabled', async () => {
    const wrapper = mount(Radio, {
      props: { disabled: true, label: 'A' },
    });
    await wrapper.find('input').setValue(true);
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  // 6. border variant
  it('applies border class', () => {
    const wrapper = mount(Radio, { props: { border: true } });
    expect(wrapper.classes()).toContain('is-border');
  });

  // 7. size class
  it('applies size class', () => {
    const wrapper = mount(Radio, { props: { size: 'large' } });
    expect(wrapper.classes()).toContain('crazy-radio--large');
  });

  it('defaults to medium size', () => {
    const wrapper = mount(Radio);
    expect(wrapper.classes()).toContain('crazy-radio--medium');
  });

  // 8. name attribute
  it('passes name attribute to hidden input', () => {
    const wrapper = mount(Radio, { props: { name: 'gender' } });
    expect(wrapper.find('input').attributes('name')).toBe('gender');
  });
});

describe('RadioGroup', () => {
  // 1. Group renders correctly
  it('renders group wrapper with role radiogroup', () => {
    const wrapper = mount(RadioGroup);
    expect(wrapper.classes()).toContain('crazy-radio-group');
    expect(wrapper.attributes('role')).toBe('radiogroup');
  });

  // 2. Single selection — selecting one deselects others
  it('selecting one radio deselects others', async () => {
    const wrapper = mount({
      components: { Radio, RadioGroup },
      template: `
        <RadioGroup v-model="selected">
          <Radio label="A" />
          <Radio label="B" />
          <Radio label="C" />
        </RadioGroup>
      `,
      setup() {
        const selected = ref<string | number | boolean>('A');
        return { selected };
      },
    });
    const inputs = wrapper.findAll('input[type="radio"]');
    expect(inputs[0].element.checked).toBe(true);
    expect(inputs[1].element.checked).toBe(false);
    expect(inputs[2].element.checked).toBe(false);

    await inputs[1].setValue(true);
    expect(wrapper.findComponent(RadioGroup).emitted('update:modelValue')?.[0]?.[0]).toBe('B');
  });

  // 3. Group disabled overrides children
  it('disables all radios when group is disabled', () => {
    const wrapper = mount({
      components: { Radio, RadioGroup },
      template: `
        <RadioGroup disabled>
          <Radio label="A" />
          <Radio label="B" />
        </RadioGroup>
      `,
    });
    const inputs = wrapper.findAll('input[type="radio"]');
    expect(inputs[0].attributes('disabled')).toBeDefined();
    expect(inputs[1].attributes('disabled')).toBeDefined();
  });

  // 4. Group size propagates to children
  it('passes size to children via context', () => {
    const wrapper = mount({
      components: { Radio, RadioGroup },
      template: `
        <RadioGroup size="small">
          <Radio label="A" />
        </RadioGroup>
      `,
    });
    const radio = wrapper.findComponent(Radio);
    expect(radio.classes()).toContain('crazy-radio--small');
  });

  // 5. Group emits change event
  it('emits change event', async () => {
    const wrapper = mount({
      components: { Radio, RadioGroup },
      template: `
        <RadioGroup>
          <Radio label="A" />
        </RadioGroup>
      `,
    });
    await wrapper.find('input').setValue(true);
    expect(wrapper.findComponent(RadioGroup).emitted('change')).toBeTruthy();
  });
});

describe('RadioButton', () => {
  // 1. Must be inside RadioGroup
  it('throws when used outside RadioGroup', () => {
    expect(() => {
      mount(RadioButton, {
        props: { label: 'A' },
      });
    }).toThrow('RadioButton must be used within a RadioGroup');
  });

  // 2. Renders correctly inside RadioGroup
  it('renders correctly inside RadioGroup', () => {
    const wrapper = mount({
      components: { RadioGroup, RadioButton },
      template: `
        <RadioGroup>
          <RadioButton label="A" />
        </RadioGroup>
      `,
    });
    const radioButton = wrapper.findComponent(RadioButton);
    expect(radioButton.classes()).toContain('crazy-radio-button');
    expect(radioButton.find('input[type="radio"]').exists()).toBe(true);
  });

  // 3. Checked state in group
  it('shows checked state when selected', () => {
    const wrapper = mount({
      components: { RadioGroup, RadioButton },
      template: `
        <RadioGroup v-model="selected">
          <RadioButton label="A" />
          <RadioButton label="B" />
        </RadioGroup>
      `,
      setup() {
        const selected = ref<string | number | boolean>('A');
        return { selected };
      },
    });
    const buttons = wrapper.findAllComponents(RadioButton);
    expect(buttons[0].classes()).toContain('is-checked');
    expect(buttons[1].classes()).not.toContain('is-checked');
  });

  // 4. Disabled state
  it('applies disabled state', () => {
    const wrapper = mount({
      components: { RadioGroup, RadioButton },
      template: `
        <RadioGroup>
          <RadioButton label="A" disabled />
        </RadioGroup>
      `,
    });
    const btn = wrapper.findComponent(RadioButton);
    expect(btn.classes()).toContain('is-disabled');
    expect(btn.find('input').attributes('disabled')).toBeDefined();
  });

  // 5. Size from group
  it('inherits size from RadioGroup', () => {
    const wrapper = mount({
      components: { RadioGroup, RadioButton },
      template: `
        <RadioGroup size="large">
          <RadioButton label="A" />
        </RadioGroup>
      `,
    });
    const btn = wrapper.findComponent(RadioButton);
    expect(btn.classes()).toContain('crazy-radio-button--large');
  });
});

describe('Radio standalone with v-model', () => {
  it('works with v-model in a parent component', async () => {
    const wrapper = mount({
      components: { Radio },
      template: `<Radio v-model="val" label="A" />`,
      setup() {
        const val = ref<string | number | boolean>('A');
        return { val };
      },
    });
    expect(wrapper.findComponent(Radio).classes()).toContain('is-checked');
    // Radio with v-model in parent: changing selection emits update:modelValue
    await wrapper.find('input').trigger('change');
    expect(wrapper.findComponent(Radio).emitted('update:modelValue')).toBeTruthy();
  });

  it('reflects updated modelValue from parent', async () => {
    const wrapper = mount({
      components: { Radio },
      template: `<Radio :model-value="val" label="A" @update:model-value="val = $event" />`,
      setup() {
        const val = ref<string | number | boolean>('');
        return { val };
      },
    });
    expect(wrapper.findComponent(Radio).classes()).not.toContain('is-checked');
    await wrapper.find('input').setValue(true);
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(Radio).classes()).toContain('is-checked');
  });
});
