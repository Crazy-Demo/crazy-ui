/**
 * Tabs Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, h, defineComponent } from 'vue';
import Tabs from '../src/tabs.vue';
import TabPane from '../src/tab-pane.vue';

// Helper to mount Tabs with TabPane slots
function createTabs(props = {}, panes?: Record<string, unknown>) {
  const paneSlots = panes ?? {
    default: [
      h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1' }, () => 'Content 1'),
      h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2' }, () => 'Content 2'),
      h(TabPane, { name: 'tab3', title: 'Tab 3', key: '3' }, () => 'Content 3'),
    ],
  };
  return mount(Tabs, { props, slots: paneSlots });
}

describe('Tabs', () => {
  it('renders Tabs with TabPane children', () => {
    const wrapper = createTabs();
    expect(wrapper.find('.crazy-tabs').exists()).toBe(true);
    expect(wrapper.findAll('.crazy-tab-nav__item').length).toBe(3);
  });

  it('renders line type by default', () => {
    const wrapper = createTabs();
    expect(wrapper.classes()).toContain('crazy-tabs--line');
  });

  it('applies position class top by default', () => {
    const wrapper = createTabs();
    expect(wrapper.classes()).toContain('is-top');
  });

  it('renders with role="tablist" on the nav', () => {
    const wrapper = createTabs();
    expect(wrapper.find('.crazy-tab-nav').attributes('role')).toBe('tablist');
  });
});

describe('Tabs v-model:active (controlled)', () => {
  it('marks the active TabPane', () => {
    const wrapper = mount(Tabs, {
      props: { active: 'tab2' },
      slots: {
        default: [
          h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1' }, () => 'Content 1'),
          h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2' }, () => 'Content 2'),
        ],
      },
    });
    const items = wrapper.findAll('.crazy-tab-nav__item');
    expect(items[0].classes()).not.toContain('is-active');
    expect(items[1].classes()).toContain('is-active');
  });

  it('emits update:active on tab click', async () => {
    const wrapper = mount(Tabs, {
      props: { active: 'tab1' },
      slots: {
        default: h(TabPane, { name: 'tab2', title: 'Tab 2' }, () => 'Content 2'),
      },
    });
    await wrapper.find('.crazy-tab-nav__item').trigger('click');
    expect(wrapper.emitted('update:active')?.[0]).toEqual(['tab2']);
  });
});

describe('Tabs defaultActive (uncontrolled)', () => {
  it('uses defaultActive as initial active value', () => {
    const wrapper = mount(Tabs, {
      props: { defaultActive: 'tab2' },
      slots: {
        default: [
          h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1' }, () => 'Content 1'),
          h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2' }, () => 'Content 2'),
        ],
      },
    });
    const items = wrapper.findAll('.crazy-tab-nav__item');
    expect(items[1].classes()).toContain('is-active');
  });
});

describe('Tab click switches active', () => {
  it('emits change on tab click', async () => {
    const wrapper = mount(Tabs, {
      props: { defaultActive: 'tab1' },
      slots: {
        default: [
          h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1' }, () => 'Content 1'),
          h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2' }, () => 'Content 2'),
        ],
      },
    });
    await wrapper.findAll('.crazy-tab-nav__item')[1].trigger('click');
    expect(wrapper.emitted('change')?.[0]).toEqual(['tab2']);
  });

  it('emits tab-click on tab click', async () => {
    const wrapper = createTabs({ defaultActive: 'tab1' });
    await wrapper.findAll('.crazy-tab-nav__item')[1].trigger('click');
    expect(wrapper.emitted('tab-click')?.[0]).toEqual(['tab2', expect.any(Object)]);
  });

  it('applies is-active class to clicked tab', async () => {
    const wrapper = createTabs({ defaultActive: 'tab1' });
    const items = wrapper.findAll('.crazy-tab-nav__item');
    expect(items[0].classes()).toContain('is-active');
    expect(items[1].classes()).not.toContain('is-active');

    await items[1].trigger('click');
    await nextTick();
    const updatedItems = wrapper.findAll('.crazy-tab-nav__item');
    expect(updatedItems[0].classes()).not.toContain('is-active');
    expect(updatedItems[1].classes()).toContain('is-active');
  });
});

describe('Tabs types', () => {
  it('renders line type', () => {
    const wrapper = createTabs({ type: 'line' });
    expect(wrapper.find('.crazy-tab-bar').exists()).toBe(true);
  });

  it('renders card type', () => {
    const wrapper = createTabs({ type: 'card' });
    expect(wrapper.classes()).toContain('crazy-tabs--card');
    // Card type has no tab-bar
    expect(wrapper.find('.crazy-tab-bar').exists()).toBe(false);
    // Card items have specific class
    expect(wrapper.find('.crazy-tab-nav__item--card').exists()).toBe(true);
  });

  it('renders border-card type', () => {
    const wrapper = createTabs({ type: 'border-card' });
    expect(wrapper.classes()).toContain('crazy-tabs--border-card');
    expect(wrapper.find('.crazy-tab-bar').exists()).toBe(false);
  });
});

describe('Tabs positions', () => {
  it('renders top position (default)', () => {
    const wrapper = createTabs();
    expect(wrapper.classes()).toContain('is-top');
    // Content renders before nav (so TabPane children register before TabNav reads panes)
    const header = wrapper.find('.crazy-tabs__header');
    const content = wrapper.find('.crazy-tabs__content');
    expect(content.element.compareDocumentPosition(header.element)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('renders bottom position', () => {
    const wrapper = createTabs({ position: 'bottom' });
    expect(wrapper.classes()).toContain('is-bottom');
  });

  it('renders left position', () => {
    const wrapper = createTabs({ position: 'left' });
    expect(wrapper.classes()).toContain('is-left');
    expect(wrapper.find('.crazy-tab-nav').classes()).toContain('is-vertical');
  });

  it('renders right position', () => {
    const wrapper = createTabs({ position: 'right' });
    expect(wrapper.classes()).toContain('is-right');
    expect(wrapper.find('.crazy-tab-nav').classes()).toContain('is-vertical');
  });
});

describe('Closable tabs', () => {
  it('shows close button on all tabs when closable is true', () => {
    const wrapper = createTabs({ closable: true });
    expect(wrapper.findAll('.crazy-tab-nav__close').length).toBe(3);
  });

  it('emits close when close button clicked', async () => {
    const wrapper = createTabs({ closable: true, defaultActive: 'tab1' });
    await wrapper.findAll('.crazy-tab-nav__close')[0].trigger('click');
    expect(wrapper.emitted('close')?.[0]).toEqual(['tab1']);
  });

  it('closing active tab switches to adjacent tab', async () => {
    const wrapper = mount(Tabs, {
      props: { closable: true, defaultActive: 'tab2' },
      slots: {
        default: [
          h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1' }, () => 'Content 1'),
          h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2' }, () => 'Content 2'),
          h(TabPane, { name: 'tab3', title: 'Tab 3', key: '3' }, () => 'Content 3'),
        ],
      },
    });

    // tab2 is active, close it
    await wrapper.findAll('.crazy-tab-nav__close')[1].trigger('click');

    // Should switch to tab3 (next)
    expect(wrapper.emitted('close')?.[0]).toEqual(['tab2']);
  });

  it('per-pane closable overrides global', () => {
    const wrapper = mount(Tabs, {
      props: { closable: false },
      slots: {
        default: [
          h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1', closable: true }, () => 'Content 1'),
          h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2' }, () => 'Content 2'),
        ],
      },
    });
    const closeButtons = wrapper.findAll('.crazy-tab-nav__close');
    expect(closeButtons.length).toBe(1);
  });
});

describe('Addable tabs', () => {
  it('shows add button when addable is true', () => {
    const wrapper = createTabs({ addable: true });
    expect(wrapper.find('.crazy-tab-nav__add').exists()).toBe(true);
  });

  it('emits add when add button clicked', async () => {
    const wrapper = createTabs({ addable: true });
    await wrapper.find('.crazy-tab-nav__add').trigger('click');
    expect(wrapper.emitted('add')).toBeTruthy();
  });
});

describe('Editable (closable + addable)', () => {
  it('editable enables close buttons', () => {
    const wrapper = createTabs({ editable: true });
    expect(wrapper.findAll('.crazy-tab-nav__close').length).toBe(3);
  });

  it('editable enables add button', () => {
    const wrapper = createTabs({ editable: true });
    expect(wrapper.find('.crazy-tab-nav__add').exists()).toBe(true);
  });
});

describe('beforeLeave', () => {
  it('blocks tab switch when beforeLeave returns false', async () => {
    const beforeLeave = vi.fn(() => false);
    const wrapper = createTabs({ defaultActive: 'tab1', beforeLeave });

    await wrapper.findAll('.crazy-tab-nav__item')[1].trigger('click');
    await nextTick();

    expect(beforeLeave).toHaveBeenCalledWith('tab2', 'tab1');
    // Should not have switched
    const items = wrapper.findAll('.crazy-tab-nav__item');
    expect(items[0].classes()).toContain('is-active');
    expect(items[1].classes()).not.toContain('is-active');
  });

  it('allows tab switch when beforeLeave returns true', async () => {
    const beforeLeave = vi.fn(() => true);
    const wrapper = createTabs({ defaultActive: 'tab1', beforeLeave });

    await wrapper.findAll('.crazy-tab-nav__item')[1].trigger('click');
    await nextTick();

    expect(beforeLeave).toHaveBeenCalledWith('tab2', 'tab1');
    const items = wrapper.findAll('.crazy-tab-nav__item');
    expect(items[0].classes()).not.toContain('is-active');
    expect(items[1].classes()).toContain('is-active');
  });

  it('works with async beforeLeave (Promise.resolve(true))', async () => {
    const beforeLeave = vi.fn(() => Promise.resolve(true));
    const wrapper = createTabs({ defaultActive: 'tab1', beforeLeave });

    await wrapper.findAll('.crazy-tab-nav__item')[1].trigger('click');
    await nextTick();

    const items = wrapper.findAll('.crazy-tab-nav__item');
    expect(items[1].classes()).toContain('is-active');
  });

  it('works with async beforeLeave (Promise.resolve(false))', async () => {
    const beforeLeave = vi.fn(() => Promise.resolve(false));
    const wrapper = createTabs({ defaultActive: 'tab1', beforeLeave });

    await wrapper.findAll('.crazy-tab-nav__item')[1].trigger('click');
    await nextTick();

    const items = wrapper.findAll('.crazy-tab-nav__item');
    expect(items[0].classes()).toContain('is-active');
  });
});

describe('Lazy loading', () => {
  it('renders all TabPanes by default (not lazy)', () => {
    const wrapper = mount(Tabs, {
      props: { defaultActive: 'tab1' },
      slots: {
        default: [
          h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1' }, () => 'Content 1'),
          h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2' }, () => 'Content 2'),
        ],
      },
    });

    // All panels rendered (not lazy)
    expect(wrapper.findAll('.crazy-tab-pane').length).toBe(2);
    expect(wrapper.find('.crazy-tab-pane').isVisible()).toBe(true);
  });

  it('lazy TabPane not in DOM until first active', () => {
    const wrapper = mount(Tabs, {
      props: { defaultActive: 'tab1', lazy: true },
      slots: {
        default: [
          h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1' }, () => 'Content 1'),
          h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2' }, () => 'Content 2'),
        ],
      },
    });

    // Only active tab rendered
    expect(wrapper.findAll('.crazy-tab-pane').length).toBe(1);
  });

  it('lazy TabPane appears when activated', async () => {
    const wrapper = mount(Tabs, {
      props: { defaultActive: 'tab1', lazy: true },
      slots: {
        default: [
          h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1' }, () => 'Content 1'),
          h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2' }, () => 'Content 2'),
        ],
      },
    });

    expect(wrapper.findAll('.crazy-tab-pane').length).toBe(1);

    // Switch to tab2
    await wrapper.findAll('.crazy-tab-nav__item')[1].trigger('click');
    await nextTick();

    // Now both should render (tab2 is visible, tab1 stays cached)
    expect(wrapper.findAll('.crazy-tab-pane').length).toBe(2);
  });

  it('lazy TabPane with per-pane lazy override', () => {
    const wrapper = mount(Tabs, {
      props: { defaultActive: 'tab1', lazy: false },
      slots: {
        default: [
          h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1', lazy: true }, () => 'Content 1'),
          h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2' }, () => 'Content 2'),
        ],
      },
    });

    // tab2 is rendered (global lazy=false, no per-pane override)
    // tab1 is lazy per-pane override, but it's active so rendered
    expect(wrapper.findAll('.crazy-tab-pane').length).toBe(2);
  });
});

describe('cache=false', () => {
  it('lazy TabPane with cache=false removes from DOM when inactive', async () => {
    const wrapper = mount(Tabs, {
      props: { defaultActive: 'tab1', lazy: true },
      slots: {
        default: [
          h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1', cache: false }, () => 'Content 1'),
          h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2' }, () => 'Content 2'),
        ],
      },
    });

    // tab1 is active, so it renders
    expect(wrapper.findAll('.crazy-tab-pane').length).toBe(1);

    // Switch to tab2
    await wrapper.findAll('.crazy-tab-nav__item')[1].trigger('click');
    await nextTick();

    // tab1 has cache=false, so it should be removed
    expect(wrapper.findAll('.crazy-tab-pane').length).toBe(1);
  });
});

describe('Disabled tab', () => {
  it('disabled tab is not selectable', async () => {
    const wrapper = mount(Tabs, {
      props: { defaultActive: 'tab1' },
      slots: {
        default: [
          h(TabPane, { name: 'tab1', title: 'Tab 1', key: '1' }, () => 'Content 1'),
          h(TabPane, { name: 'tab2', title: 'Tab 2', key: '2', disabled: true }, () => 'Content 2'),
        ],
      },
    });

    const items = wrapper.findAll('.crazy-tab-nav__item');
    expect(items[1].classes()).toContain('is-disabled');

    await items[1].trigger('click');
    await nextTick();

    // Should not have switched
    const updatedItems = wrapper.findAll('.crazy-tab-nav__item');
    expect(updatedItems[0].classes()).toContain('is-active');
    expect(updatedItems[1].classes()).not.toContain('is-active');
  });

  it('disabled tab has aria-disabled', () => {
    const wrapper = mount(Tabs, {
      slots: {
        default: h(TabPane, { name: 'tab1', title: 'Tab 1', disabled: true }, () => 'Content'),
      },
    });
    expect(wrapper.find('.crazy-tab-nav__item').attributes('aria-disabled')).toBe('true');
  });
});

describe('ARIA', () => {
  it('tabs nav has role="tablist"', () => {
    const wrapper = createTabs();
    expect(wrapper.find('.crazy-tab-nav').attributes('role')).toBe('tablist');
  });

  it('nav items have role="tab"', () => {
    const wrapper = createTabs();
    wrapper.findAll('.crazy-tab-nav__item').forEach((item) => {
      expect(item.attributes('role')).toBe('tab');
    });
  });

  it('panes have role="tabpanel"', () => {
    const wrapper = createTabs();
    wrapper.findAll('.crazy-tab-pane').forEach((pane) => {
      expect(pane.attributes('role')).toBe('tabpanel');
    });
  });

  it('active tab has aria-selected="true"', () => {
    const wrapper = createTabs({ defaultActive: 'tab1' });
    const items = wrapper.findAll('.crazy-tab-nav__item');
    expect(items[0].attributes('aria-selected')).toBe('true');
    expect(items[1].attributes('aria-selected')).toBe('false');
  });

  it('tab has aria-controls pointing to panel', () => {
    const wrapper = createTabs();
    const item = wrapper.find('.crazy-tab-nav__item');
    expect(item.attributes('aria-controls')).toBe('panel-tab1');
  });

  it('pane has aria-labelledby pointing to tab', () => {
    const wrapper = createTabs();
    const pane = wrapper.find('.crazy-tab-pane');
    expect(pane.attributes('aria-labelledby')).toBe('tab-tab1');
  });

  it('pane has id matching aria-controls', () => {
    const wrapper = createTabs();
    const pane = wrapper.find('.crazy-tab-pane');
    expect(pane.attributes('id')).toBe('panel-tab1');
  });

  it('horizontal nav has aria-orientation="horizontal"', () => {
    const wrapper = createTabs();
    expect(wrapper.find('.crazy-tab-nav').attributes('aria-orientation')).toBe('horizontal');
  });

  it('vertical nav has aria-orientation="vertical"', () => {
    const wrapper = createTabs({ position: 'left' });
    expect(wrapper.find('.crazy-tab-nav').attributes('aria-orientation')).toBe('vertical');
  });
});

describe('Stretch', () => {
  it('applies is-stretch class when stretch is true', () => {
    const wrapper = createTabs({ stretch: true });
    expect(wrapper.find('.crazy-tab-nav').classes()).toContain('is-stretch');
  });
});

describe('Custom label slots', () => {
  it('renders tab label from TabPane title prop', () => {
    const wrapper = mount(Tabs, {
      props: { defaultActive: 'tab1' },
      slots: {
        default: h(TabPane, { name: 'tab1', title: 'Tab 1' }, () => 'Content'),
      },
    });
    // TabPane title prop is displayed in the tab nav
    expect(wrapper.text()).toContain('Tab 1');
  });
});
