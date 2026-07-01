/**
 * Menu Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, h, defineComponent } from 'vue';
import Menu from '../src/menu.vue';
import MenuItem from '../src/menu-item.vue';
import SubMenu from '../src/sub-menu.vue';
import MenuItemGroup from '../src/menu-item-group.vue';

// Helper to create a test wrapper with template for SubMenu testing
function mountWithTemplate(menuProps: Record<string, unknown> = {}, subSlot = '') {
  const Comp = defineComponent({
    template: `
      <Menu v-bind="menuProps">
        <SubMenu index="sub-1">
          <template #title>${subSlot || 'Sub Menu Title'}</template>
          <MenuItem index="1-1">Sub Item 1</MenuItem>
        </SubMenu>
      </Menu>
    `,
    components: { Menu, SubMenu, MenuItem },
    setup() {
      return { menuProps };
    },
  });
  return mount(Comp);
}

// Helper to render menu with items inside a Menu parent
function createMenu(props = {}, slots?: Record<string, unknown>) {
  return mount(Menu, {
    props,
    slots: slots || {
      default: [
        h(MenuItem, { index: '1', key: '1' }, 'Item 1'),
        h(MenuItem, { index: '2', key: '2' }, 'Item 2'),
        h(MenuItem, { index: '3', key: '3', disabled: true }, 'Item 3 (disabled)'),
      ],
    },
  });
}

// Helper to mount a MenuItem within a Menu parent
function mountMenuItem(props = {}) {
  return mount(Menu, {
    slots: {
      default: h(MenuItem, props, 'Item'),
    },
  });
}

// Helper to mount MenuItemGroup within a Menu parent
function mountMenuItemGroup(groupProps: Record<string, unknown> = {}, groupSlots?: Record<string, unknown>) {
  return mount(Menu, {
    slots: {
      default: h(MenuItemGroup, groupProps, groupSlots || {
        default: () => h(MenuItem, { index: 'g-1' }, 'Group Item'),
      }),
    },
  });
}

// Check if children element has display:none style (v-show false) or not (v-show true)
function childrenDisplay(wrapper: ReturnType<typeof mount>) {
  const children = wrapper.find('.crazy-sub-menu__children');
  if (!children.exists()) return 'not-found';
  const style = children.attributes('style') || '';
  return style.includes('display: none') ? 'hidden' : 'visible';
}

describe('Menu', () => {
  it('renders Menu with MenuItem children', () => {
    const wrapper = createMenu();
    expect(wrapper.find('.crazy-menu').exists()).toBe(true);
    expect(wrapper.findAll('.crazy-menu__item').length).toBe(3);
  });

  it('renders with role="menu"', () => {
    const wrapper = createMenu();
    expect(wrapper.attributes('role')).toBe('menu');
  });

  it('applies vertical mode class by default', () => {
    const wrapper = createMenu();
    expect(wrapper.classes()).toContain('crazy-menu--vertical');
    expect(wrapper.classes()).not.toContain('crazy-menu--horizontal');
  });

  it('applies horizontal mode class', () => {
    const wrapper = createMenu({ mode: 'horizontal' });
    expect(wrapper.classes()).toContain('crazy-menu--horizontal');
    expect(wrapper.attributes('aria-orientation')).toBe('horizontal');
  });

  it('applies is-collapse class when collapse is true', () => {
    const wrapper = createMenu({ collapse: true });
    expect(wrapper.classes()).toContain('is-collapse');
  });
});

describe('Menu v-model:active (controlled)', () => {
  it('marks the active MenuItem', () => {
    const wrapper = mount(Menu, {
      props: { active: '2' },
      slots: {
        default: [
          h(MenuItem, { index: '1', key: '1' }, 'Item 1'),
          h(MenuItem, { index: '2', key: '2' }, 'Item 2'),
        ],
      },
    });
    const items = wrapper.findAll('.crazy-menu__item');
    expect(items[0].classes()).not.toContain('is-active');
    expect(items[1].classes()).toContain('is-active');
  });

  it('emits update:active on MenuItem click', async () => {
    const wrapper = mount(Menu, {
      props: { active: '1' },
      slots: {
        default: h(MenuItem, { index: '2' }, 'Item 2'),
      },
    });
    await wrapper.find('.crazy-menu__item').trigger('click');
    expect(wrapper.emitted('update:active')?.[0]).toEqual(['2']);
  });
});

describe('Menu defaultActive (uncontrolled)', () => {
  it('uses defaultActive as initial active value', () => {
    const wrapper = mount(Menu, {
      props: { defaultActive: '2' },
      slots: {
        default: [
          h(MenuItem, { index: '1', key: '1' }, 'Item 1'),
          h(MenuItem, { index: '2', key: '2' }, 'Item 2'),
        ],
      },
    });
    const items = wrapper.findAll('.crazy-menu__item');
    expect(items[1].classes()).toContain('is-active');
  });
});

describe('MenuItem', () => {
  it('emits change on click', async () => {
    const wrapper = mountMenuItem({ index: '1' });
    await wrapper.find('.crazy-menu__item').trigger('click');
    expect(wrapper.emitted('change')?.[0]).toEqual(['1']);
  });

  it('does not emit change when disabled', async () => {
    const wrapper = mountMenuItem({ index: '1', disabled: true });
    await wrapper.find('.crazy-menu__item').trigger('click');
    expect(wrapper.emitted('change')).toBeFalsy();
  });

  it('has aria-disabled when disabled', () => {
    const wrapper = mountMenuItem({ index: '1', disabled: true });
    expect(wrapper.find('.crazy-menu__item').attributes('aria-disabled')).toBe('true');
  });

  it('has role="menuitem"', () => {
    const wrapper = mountMenuItem({ index: '1' });
    expect(wrapper.find('.crazy-menu__item').attributes('role')).toBe('menuitem');
  });

  it('applies is-disabled class when disabled', () => {
    const wrapper = mountMenuItem({ index: '1', disabled: true });
    expect(wrapper.find('.crazy-menu__item').classes()).toContain('is-disabled');
  });

  it('is selectable when not disabled', async () => {
    const wrapper = mountMenuItem({ index: '1' });
    const item = wrapper.find('.crazy-menu__item');
    expect(item.classes()).not.toContain('is-active');
    await item.trigger('click');
    expect(item.classes()).toContain('is-active');
  });

  it('disabled MenuItem is not selectable', async () => {
    const wrapper = mountMenuItem({ index: '1', disabled: true });
    const item = wrapper.find('.crazy-menu__item');
    await item.trigger('click');
    expect(wrapper.emitted('change')).toBeFalsy();
  });

  it('emits change and select on click', async () => {
    const wrapper = mountMenuItem({ index: '1' });
    await wrapper.find('.crazy-menu__item').trigger('click');
    expect(wrapper.emitted('change')?.[0]).toEqual(['1']);
    expect(wrapper.emitted('select')?.[0]).toEqual(['1']);
  });
});

describe('SubMenu', () => {
  it('renders SubMenu with title slot', () => {
    const wrapper = mountWithTemplate();
    expect(wrapper.find('.crazy-sub-menu').exists()).toBe(true);
    expect(wrapper.text()).toContain('Sub Menu Title');
  });

  it('opens on click when trigger is click (h approach)', async () => {
    const wrapper = mount(Menu, {
      props: { subMenuTrigger: 'click' },
      slots: {
        default: h(SubMenu, { index: 'sub-1' }, {
          default: () => h(MenuItem, { index: '1-1' }, 'Sub Item'),
          title: () => 'Title',
        }),
      },
    });
    expect(childrenDisplay(wrapper)).toBe('hidden');
    await wrapper.find('.crazy-sub-menu__title').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-sub-menu__arrow').classes()).toContain('is-open');
    expect(childrenDisplay(wrapper)).toBe('visible');
  });

  it('shows arrow with is-open class when opened', async () => {
    const wrapper = mountWithTemplate({ subMenuTrigger: 'click' });
    const arrow = wrapper.find('.crazy-sub-menu__arrow');
    expect(arrow.classes()).not.toContain('is-open');
    await wrapper.find('.crazy-sub-menu__title').trigger('click');
    await nextTick();
    expect(arrow.classes()).toContain('is-open');
    expect(childrenDisplay(wrapper)).toBe('visible');
  });

  it('does not open on click when trigger is hover (default)', async () => {
    const wrapper = mountWithTemplate();
    await wrapper.find('.crazy-sub-menu__title').trigger('click');
    expect(childrenDisplay(wrapper)).toBe('hidden');
  });

  it('opens/closes via toggle when trigger is click', async () => {
    const wrapper = mountWithTemplate({ subMenuTrigger: 'click' });

    // Open
    await wrapper.find('.crazy-sub-menu__title').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-sub-menu__arrow').classes()).toContain('is-open');
    expect(childrenDisplay(wrapper)).toBe('visible');

    // Close (click again)
    await wrapper.find('.crazy-sub-menu__title').trigger('click');
    await nextTick();
    expect(wrapper.find('.crazy-sub-menu__arrow').classes()).not.toContain('is-open');
    expect(childrenDisplay(wrapper)).toBe('hidden');
  });

  it('opens on mouseenter when trigger is hover (default)', async () => {
    vi.useFakeTimers();
    const wrapper = mount(Menu, {
      slots: {
        default: h(SubMenu, { index: 'sub-1', showTimeout: 0 }, {
          default: () => h(MenuItem, { index: '1-1' }, 'Sub Item'),
          title: () => 'Title',
        }),
      },
    });
    await wrapper.find('.crazy-sub-menu').trigger('mouseenter');
    vi.advanceTimersByTime(0);
    await nextTick();
    expect(childrenDisplay(wrapper)).toBe('visible');
    vi.useRealTimers();
  });
});

describe('uniqueOpened', () => {
  it('closes other SubMenus when one is opened with uniqueOpened', async () => {
    const Comp = defineComponent({
      template: `
        <Menu :uniqueOpened="true" :subMenuTrigger="'click'">
          <SubMenu index="sub-1">
            <template #title>Menu 1</template>
            <MenuItem index="1-1">Sub Item 1</MenuItem>
          </SubMenu>
          <SubMenu index="sub-2">
            <template #title>Menu 2</template>
            <MenuItem index="2-1">Sub Item 2</MenuItem>
          </SubMenu>
        </Menu>
      `,
      components: { Menu, SubMenu, MenuItem },
    });
    const wrapper = mount(Comp);

    // Open first sub-menu
    await wrapper.findAll('.crazy-sub-menu__title')[0].trigger('click');
    await nextTick();
    expect(childrenDisplay(wrapper)).toBe('visible');
    // wrapper.findAll returns fresh results every time (VTU v2+)
    let allChildren = wrapper.findAll('.crazy-sub-menu__children');
    expect(allChildren[0].attributes('style')).not.toContain('display: none');

    // Open second sub-menu
    await wrapper.findAll('.crazy-sub-menu__title')[1].trigger('click');
    await nextTick();
    allChildren = wrapper.findAll('.crazy-sub-menu__children');
    expect(allChildren[1].attributes('style')).not.toContain('display: none');
    // First should now be closed
    expect(allChildren[0].attributes('style')).toContain('display: none');
  });
});

describe('MenuItemGroup', () => {
  it('renders with title', () => {
    const wrapper = mountMenuItemGroup({ title: 'Group Title' });
    expect(wrapper.find('.crazy-menu-item-group').exists()).toBe(true);
    expect(wrapper.text()).toContain('Group Title');
    expect(wrapper.find('.crazy-menu-item-group__group').exists()).toBe(true);
  });

  it('renders without title', () => {
    const wrapper = mountMenuItemGroup();
    expect(wrapper.find('.crazy-menu-item-group').exists()).toBe(true);
    expect(wrapper.find('.crazy-menu-item-group__title').exists()).toBe(false);
  });

  it('renders title slot when title prop is not set', () => {
    const wrapper = mountMenuItemGroup({}, {
      title: () => 'Slot Title',
      default: () => h(MenuItem, { index: 'g-1' }, 'Group Item'),
    });
    expect(wrapper.text()).toContain('Slot Title');
  });

  it('renders MenuItem children', () => {
    const wrapper = mountMenuItemGroup({ title: 'Group' }, {
      default: [
        h(MenuItem, { index: 'g-1', key: 'g-1' }, 'Item 1'),
        h(MenuItem, { index: 'g-2', key: 'g-2' }, 'Item 2'),
      ],
    });
    expect(wrapper.findAll('.crazy-menu__item').length).toBe(2);
  });
});

describe('Menu color props', () => {
  it('sets background-color from backgroundColor prop', () => {
    const wrapper = createMenu({ backgroundColor: '#1a1a1a' });
    const style = wrapper.attributes('style') || '';
    expect(style).toContain('background-color');
    expect(style).toContain('26, 26, 26');
  });

  it('sets color from textColor prop', () => {
    const wrapper = createMenu({ textColor: '#ffffff' });
    const style = wrapper.attributes('style') || '';
    expect(style).toContain('color');
    expect(style).toContain('255, 255, 255');
  });

  it('sets both backgroundColor and textColor', () => {
    const wrapper = createMenu({
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
    });
    const style = wrapper.attributes('style') || '';
    expect(style).toContain('background-color');
    expect(style).toContain('color');
  });
});

describe('SubMenu disabled', () => {
  it('does not open on click when disabled with subMenuTrigger click', async () => {
    const Comp = defineComponent({
      template: `
        <Menu :subMenuTrigger="'click'">
          <SubMenu index="sub-1" :disabled="true">
            <template #title>Disabled Sub</template>
            <MenuItem index="1-1">Sub Item</MenuItem>
          </SubMenu>
        </Menu>
      `,
      components: { Menu, SubMenu, MenuItem },
    });
    const wrapper = mount(Comp);
    await wrapper.find('.crazy-sub-menu__title').trigger('click');
    expect(childrenDisplay(wrapper)).toBe('hidden');
  });

  it('applies is-disabled class to SubMenu', () => {
    const Comp = defineComponent({
      template: `
        <Menu>
          <SubMenu index="sub-1" :disabled="true">
            <template #title>Sub</template>
          </SubMenu>
        </Menu>
      `,
      components: { Menu, SubMenu },
    });
    const wrapper = mount(Comp);
    expect(wrapper.find('.crazy-sub-menu').classes()).toContain('is-disabled');
  });
});

describe('Menu emits', () => {
  it('emits open and close when SubMenu toggles (h approach)', async () => {
    const wrapper = mount(Menu, {
      props: { subMenuTrigger: 'click' },
      slots: {
        default: h(SubMenu, { index: 'sub-1' }, {
          default: () => h(MenuItem, { index: '1-1' }, 'Sub Item'),
          title: () => 'Sub',
        }),
      },
    });
    // Open
    await wrapper.find('.crazy-sub-menu__title').trigger('click');
    await nextTick();
    expect(wrapper.emitted('open')?.[0]).toEqual(['sub-1']);

    // Close
    await wrapper.find('.crazy-sub-menu__title').trigger('click');
    await nextTick();
    expect(wrapper.emitted('close')?.[0]).toEqual(['sub-1']);
  });
});
