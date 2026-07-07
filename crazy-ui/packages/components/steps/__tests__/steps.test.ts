import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Steps from '../src/steps.vue';
import Step from '../src/step.vue';

function createSteps(props = {}, stepPropsList: Record<string, any>[] = []) {
  const children = stepPropsList.map((p, i) =>
    h(Step, { title: `Step ${i + 1}`, index: i, ...p }),
  );
  return mount(Steps as any, {
    props,
    slots: { default: children },
  });
}

describe('Steps', () => {
  // 1. Renders steps
  it('renders steps', () => {
    const wrapper = createSteps(
      { active: 0 },
      [{}, {}],
    );
    const steps = wrapper.findAll('.crazy-step');
    expect(steps).toHaveLength(2);
  });

  // 2. Active step shows process status
  it('marks active step as process', () => {
    const wrapper = createSteps(
      { active: 0 },
      [{}, {}],
    );
    const steps = wrapper.findAll('.crazy-step');
    expect(steps[0].classes()).toContain('is-process');
    expect(steps[1].classes()).toContain('is-wait');
  });

  // 3. Finish status for completed steps
  it('marks completed steps as finish', () => {
    const wrapper = createSteps(
      { active: 1 },
      [{}, {}, {}],
    );
    const steps = wrapper.findAll('.crazy-step');
    expect(steps[0].classes()).toContain('is-finish');
    expect(steps[1].classes()).toContain('is-process');
    expect(steps[2].classes()).toContain('is-wait');
  });

  // 4. Error status via explicit prop
  it('accepts explicit error status on step', () => {
    const wrapper = createSteps(
      { active: 1 },
      [{ status: 'error' }, {}],
    );
    const steps = wrapper.findAll('.crazy-step');
    expect(steps[0].classes()).toContain('is-error');
  });

  // 5. Title and description rendering
  it('renders title and description', () => {
    const wrapper = createSteps(
      { active: 0 },
      [{ title: 'First', description: 'First step' }],
    );
    expect(wrapper.text()).toContain('First');
    expect(wrapper.text()).toContain('First step');
  });

  // 6. Direction vertical
  it('applies vertical direction class', () => {
    const wrapper = createSteps(
      { active: 0, direction: 'vertical' },
      [{}],
    );
    expect(wrapper.classes()).toContain('crazy-steps--vertical');
  });

  // 7. Status icon for finish (checkmark)
  it('shows checkmark icon for finish step', () => {
    const wrapper = createSteps(
      { active: 1 },
      [{}, {}],
    );
    const steps = wrapper.findAll('.crazy-step');
    // First step is finish, should show checkmark
    expect(steps[0].find('.crazy-step__icon').text()).toBe('✓');
  });

  // 8. Shows step number for wait/process steps
  it('shows step number for wait/process steps', () => {
    const wrapper = createSteps(
      { active: 0 },
      [{}, {}],
    );
    const steps = wrapper.findAll('.crazy-step');
    // Process step shows number
    expect(steps[0].find('.crazy-step__number').text()).toBe('1');
    // Wait step shows number
    expect(steps[1].find('.crazy-step__number').text()).toBe('2');
  });

  // 9. Error icon
  it('shows error icon for error status', () => {
    const wrapper = createSteps(
      { active: 0 },
      [{ status: 'error' }, {}],
    );
    const steps = wrapper.findAll('.crazy-step');
    expect(steps[0].find('.crazy-step__icon').text()).toBe('✕');
  });

  // 10. finishStatus prop customizes completed state
  it('uses finishStatus prop', () => {
    const wrapper = createSteps(
      { active: 1, finishStatus: 'error' },
      [{}, {}],
    );
    const steps = wrapper.findAll('.crazy-step');
    expect(steps[0].classes()).toContain('is-error');
  });
});
