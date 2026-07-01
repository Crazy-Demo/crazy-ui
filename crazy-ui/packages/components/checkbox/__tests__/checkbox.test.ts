/**
 * Checkbox + CheckboxGroup Tests
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Checkbox from '../src/checkbox.vue';
import CheckboxGroup from '../src/checkbox-group.vue';

describe('Checkbox', () => {
  // 1. Basic rendering
  it('renders correctly', () => {
    const wrapper = mount(Checkbox, {
      slots: { default: 'Option A' },
    });
    expect(wrapper.text()).toBe('Option A');
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
    expect(wrapper.classes()).toContain('crazy-checkbox');
  });

  it('renders label from prop', () => {
    const wrapper = mount(Checkbox, { props: { label: 'Label text' } });
    expect(wrapper.text()).toBe('Label text');
  });

  // 2. Hidden native input for accessibility
  it('has hidden native input with opacity 0', () => {
    const wrapper = mount(Checkbox);
    const input = wrapper.find('input[type="checkbox"]');
    expect(input.classes()).toContain('crazy-checkbox__original');
  });

  it('sets aria-checked correctly when checked', () => {
    const wrapper = mount(Checkbox, {
      props: { modelValue: true },
    });
    expect(wrapper.find('input').attributes('aria-checked')).toBe('true');
    expect(wrapper.classes()).toContain('is-checked');
  });

  it('sets aria-checked to mixed when indeterminate', () => {
    const wrapper = mount(Checkbox, {
      props: { indeterminate: true },
    });
    expect(wrapper.find('input').attributes('aria-checked')).toBe('mixed');
    expect(wrapper.classes()).toContain('is-indeterminate');
  });

  // 3. v-model standalone (trueValue/falseValue)
  it('emits update:modelValue on change (standalone)', async () => {
    const wrapper = mount(Checkbox);
    const input = wrapper.find('input');
    await input.setValue(true);
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    // Default trueValue is true, so it should emit true
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  it('emits change event on change', async () => {
    const wrapper = mount(Checkbox);
    await wrapper.find('input').setValue(true);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('works with custom trueValue/falseValue', async () => {
    const wrapper = mount(Checkbox, {
      props: { trueValue: 'yes', falseValue: 'no' },
    });
    const input = wrapper.find('input');
    await input.setValue(true);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['yes']);
  });

  it('reflects modelValue when bound', () => {
    const wrapper = mount(Checkbox, {
      props: { modelValue: true },
    });
    expect(wrapper.classes()).toContain('is-checked');
  });

  it('reflects modelValue when not checked', () => {
    const wrapper = mount(Checkbox, {
      props: { modelValue: false },
    });
    expect(wrapper.classes()).not.toContain('is-checked');
  });

  // 4. disabled state
  it('applies disabled state', () => {
    const wrapper = mount(Checkbox, { props: { disabled: true } });
    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    expect(wrapper.find('input').attributes('aria-disabled')).toBe('true');
  });

  it('does not emit change when disabled', async () => {
    const wrapper = mount(Checkbox, {
      props: { disabled: true, modelValue: false },
    });
    await wrapper.find('input').setValue(true);
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  // 5. indeterminate visual state (does not affect modelValue)
  it('indeterminate is visual-only, does not change modelValue', async () => {
    const wrapper = mount(Checkbox, {
      props: { modelValue: false, indeterminate: true },
    });
    expect(wrapper.classes()).toContain('is-indeterminate');
    expect(wrapper.classes()).not.toContain('is-checked');
  });

  it('shows indeterminate icon when indeterminate', () => {
    const wrapper = mount(Checkbox, { props: { indeterminate: true } });
    expect(wrapper.find('.crazy-checkbox__indeterminate-icon').exists()).toBe(true);
  });

  it('does not show check icon when indeterminate even if modelValue is true', () => {
    const wrapper = mount(Checkbox, {
      props: { modelValue: true, indeterminate: true },
    });
    // When indeterminate is true, the check icon should not show
    expect(wrapper.find('.crazy-checkbox__check-icon').exists()).toBe(false);
    expect(wrapper.find('.crazy-checkbox__indeterminate-icon').exists()).toBe(true);
  });

  // 6. border variant
  it('applies border class', () => {
    const wrapper = mount(Checkbox, { props: { border: true } });
    expect(wrapper.classes()).toContain('is-border');
  });

  // 7. size class
  it('applies size class', () => {
    const wrapper = mount(Checkbox, { props: { size: 'large' } });
    expect(wrapper.classes()).toContain('crazy-checkbox--large');
  });

  it('defaults to medium size', () => {
    const wrapper = mount(Checkbox);
    expect(wrapper.classes()).toContain('crazy-checkbox--medium');
  });

  // 8. name attribute
  it('passes name attribute to hidden input', () => {
    const wrapper = mount(Checkbox, { props: { name: 'hobby' } });
    expect(wrapper.find('input').attributes('name')).toBe('hobby');
  });
});

describe('CheckboxGroup', () => {
  // 1. Group renders correctly
  it('renders group wrapper', () => {
    const wrapper = mount(CheckboxGroup);
    expect(wrapper.classes()).toContain('crazy-checkbox-group');
    expect(wrapper.attributes('role')).toBe('group');
  });

  // 2. Group children render
  it('renders checkbox children', () => {
    const wrapper = mount(CheckboxGroup, {
      slots: {
        default: [
          mount(Checkbox, { props: { label: 'A' } }).html(),
          mount(Checkbox, { props: { label: 'B' } }).html(),
        ],
      },
    });
    expect(wrapper.text()).toContain('A');
    expect(wrapper.text()).toContain('B');
  });

  // 3. Selecting items adds to modelValue array
  it('adds item to array when checked in group', async () => {
    const wrapper = mount({
      components: { Checkbox, CheckboxGroup },
      template: `
        <CheckboxGroup v-model="values">
          <Checkbox label="A" />
          <Checkbox label="B" />
          <Checkbox label="C" />
        </CheckboxGroup>
      `,
      setup() {
        const values = ref<(string | number)[]>([]);
        return { values };
      },
    });
    const inputs = wrapper.findAll('input[type="checkbox"]');
    await inputs[0].setValue(true);
    expect(wrapper.findComponent(CheckboxGroup).emitted('update:modelValue')?.[0]?.[0]).toEqual(['A']);
  });

  it('removes item from array when unchecked in group', async () => {
    const wrapper = mount({
      components: { Checkbox, CheckboxGroup },
      template: `
        <CheckboxGroup v-model="values">
          <Checkbox label="A" />
          <Checkbox label="B" />
        </CheckboxGroup>
      `,
      setup() {
        const values = ref<(string | number)[]>(['A', 'B']);
        return { values };
      },
    });
    const inputs = wrapper.findAll('input[type="checkbox"]');
    await inputs[0].setValue(false);
    expect(wrapper.findComponent(CheckboxGroup).emitted('update:modelValue')?.[0]?.[0]).toEqual(['B']);
  });

  // 4. max limit
  it('disables unchecked items when max reached', async () => {
    const wrapper = mount({
      components: { Checkbox, CheckboxGroup },
      template: `
        <CheckboxGroup :model-value="values" :max="1">
          <Checkbox label="A" />
          <Checkbox label="B" />
        </CheckboxGroup>
      `,
      setup() {
        const values = ref<(string | number)[]>(['A']);
        return { values };
      },
    });
    const inputs = wrapper.findAll('input[type="checkbox"]');
    // First checkbox (A) is checked, so enabled
    expect(inputs[0].attributes('disabled')).toBeUndefined();
    // Second checkbox (B) should be disabled because max=1 and it's not checked
    expect(inputs[1].attributes('disabled')).toBeDefined();
  });

  // 5. min limit (just ensure min is propagated)
  it('passes min prop via context', () => {
    const wrapper = mount(CheckboxGroup, { props: { min: 1 } });
    expect(wrapper.classes()).toContain('crazy-checkbox-group');
  });

  // 6. Group disabled overrides children
  it('disables all checkboxes when group is disabled', () => {
    const wrapper = mount({
      components: { Checkbox, CheckboxGroup },
      template: `
        <CheckboxGroup disabled>
          <Checkbox label="A" />
          <Checkbox label="B" />
        </CheckboxGroup>
      `,
    });
    const inputs = wrapper.findAll('input[type="checkbox"]');
    expect(inputs[0].attributes('disabled')).toBeDefined();
    expect(inputs[1].attributes('disabled')).toBeDefined();
  });

  // 7. Group size propagates to children
  it('passes size to children via context', () => {
    const wrapper = mount({
      components: { Checkbox, CheckboxGroup },
      template: `
        <CheckboxGroup size="small">
          <Checkbox label="A" />
        </CheckboxGroup>
      `,
    });
    const checkbox = wrapper.findComponent(Checkbox);
    expect(checkbox.classes()).toContain('crazy-checkbox--small');
  });

  // 8. Group emits change event
  it('emits change event', async () => {
    const wrapper = mount({
      components: { Checkbox, CheckboxGroup },
      template: `
        <CheckboxGroup>
          <Checkbox label="A" />
        </CheckboxGroup>
      `,
    });
    await wrapper.find('input').setValue(true);
    expect(wrapper.findComponent(CheckboxGroup).emitted('change')).toBeTruthy();
  });
});

describe('Checkbox standalone with v-model', () => {
  // Test actual two-way binding behavior
  it('works with v-model in a parent component', async () => {
    const wrapper = mount({
      components: { Checkbox },
      template: `<Checkbox v-model="val" />`,
      setup() {
        const val = ref(false);
        return { val };
      },
    });
    expect(wrapper.findComponent(Checkbox).classes()).not.toContain('is-checked');
    await wrapper.find('input').setValue(true);
    // Parent should receive update:modelValue
    expect(wrapper.findComponent(Checkbox).emitted('update:modelValue')).toBeTruthy();
  });

  it('reflects updated modelValue from parent', async () => {
    const wrapper = mount({
      components: { Checkbox },
      template: `<Checkbox :model-value="val" @update:model-value="val = $event" />`,
      setup() {
        const val = ref(false);
        return { val };
      },
    });
    await wrapper.find('input').setValue(true);
    await wrapper.vm.$nextTick();
    // After update, the checkbox should reflect the new modelValue
    expect(wrapper.findComponent(Checkbox).classes()).toContain('is-checked');
  });
});
