import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, defineComponent, h } from 'vue';
import Collapse from '../src/collapse.vue';
import CollapseItem from '../src/collapse-item.vue';

function createCollapse(props = {}, items: Record<string, unknown>[] = [{}]) {
  const children = items.map((p, i) =>
    h(CollapseItem, { name: `panel-${i}`, title: `Title ${i}`, ...p }, {
      default: () => `Content ${i}`,
    })
  );
  const wrapper = mount(Collapse, {
    props: { modelValue: [], ...props },
    slots: { default: () => children },
  });
  return wrapper;
}

describe('Collapse', () => {
  // 1. Renders collapse container
  it('renders the collapse container', () => {
    const wrapper = createCollapse();
    expect(wrapper.find('.crazy-collapse').exists()).toBe(true);
  });

  // 2. Renders collapse items
  it('renders collapse items', () => {
    const wrapper = createCollapse({}, [{}, {}]);
    expect(wrapper.findAll('.crazy-collapse-item').length).toBe(2);
  });

  // 3. Items start closed by default
  it('starts with all items closed', () => {
    const wrapper = createCollapse({}, [{}, {}]);
    const contents = wrapper.findAll('.crazy-collapse-item__content');
    contents.forEach((c) => {
      expect(c.attributes('style')).toContain('display: none');
    });
  });

  // 4. Click toggles item open
  it('toggles item open on click', async () => {
    const wrapper = createCollapse({ modelValue: [] }, [{}]);
    const header = wrapper.find('.crazy-collapse-item__header');
    await header.trigger('click');
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['panel-0']]);
  });

  // 5. Click toggles item closed
  it('toggles item closed on second click', async () => {
    const wrapper = createCollapse({ modelValue: ['panel-0'] }, [{}]);
    const header = wrapper.find('.crazy-collapse-item__header');
    await header.trigger('click');
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([[]]);
  });

  // 6. Accordion mode: only one open at a time
  it('accordion mode allows only one open panel', async () => {
    const wrapper = createCollapse({ accordion: true, modelValue: [] }, [{}, {}]);
    const headers = wrapper.findAll('.crazy-collapse-item__header');

    await headers[0].trigger('click');
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['panel-0']]);

    await headers[1].trigger('click');
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![1]).toEqual([['panel-1']]);
  });

  // 7. Accordion: clicking active panel closes it
  it('accordion mode closes active panel on click', async () => {
    const wrapper = createCollapse({ accordion: true, modelValue: ['panel-0'] }, [{}]);
    const header = wrapper.find('.crazy-collapse-item__header');
    await header.trigger('click');
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([[]]);
  });

  // 8. Title slot
  it('renders title slot', () => {
    const children = [
      h(CollapseItem, { name: 'panel-0', title: 'Default Title' }, {
        title: () => 'Custom Title',
      }),
    ];
    const wrapper = mount(Collapse, {
      props: { modelValue: [] },
      slots: { default: () => children },
    });
    expect(wrapper.find('.crazy-collapse-item__header').text()).toContain('Custom Title');
  });

  // 9. Disabled item cannot be toggled
  it('disabled item cannot be toggled', async () => {
    const wrapper = createCollapse({ modelValue: [] }, [{ disabled: true }]);
    const header = wrapper.find('.crazy-collapse-item__header');
    await header.trigger('click');
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  // 10. Disabled item has disabled class
  it('disabled item has is-disabled class', () => {
    const wrapper = createCollapse({ modelValue: [] }, [{ disabled: true }]);
    const item = wrapper.find('.crazy-collapse-item');
    expect(item.classes()).toContain('is-disabled');
  });

  // 11. Active item has is-active class
  it('active item has is-active class', () => {
    const wrapper = createCollapse({ modelValue: ['panel-0'] }, [{}]);
    const item = wrapper.find('.crazy-collapse-item');
    expect(item.classes()).toContain('is-active');
  });

  // 12. Arrow rotates when active
  it('arrow has is-active class when panel is active', () => {
    const wrapper = createCollapse({ modelValue: ['panel-0'] }, [{}]);
    const arrow = wrapper.find('.crazy-collapse-item__arrow');
    expect(arrow.classes()).toContain('is-active');
  });

  // 13. aria-expanded attribute
  it('sets aria-expanded on header', () => {
    const wrapper = createCollapse({ modelValue: ['panel-0'] }, [{}]);
    const header = wrapper.find('.crazy-collapse-item__header');
    expect(header.attributes('aria-expanded')).toBe('true');
  });

  // 14. Default slot content in body
  it('renders default slot content inside collapse item', async () => {
    const child = h(CollapseItem, { name: 'panel-0' }, {
      default: () => 'Panel Content',
    });
    const wrapper = mount(Collapse, {
      props: { modelValue: ['panel-0'] },
      slots: { default: () => [child] },
    });
    const content = wrapper.find('.crazy-collapse-item__content');
    expect(content.text()).toContain('Panel Content');
  });
});
