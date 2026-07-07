import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Drawer from '../src/drawer.vue';

// Helper: query teleported elements in document.body
function bySelector(sel: string) {
  return document.body.querySelector(sel) as HTMLElement | null;
}

function drawerEl() {
  return bySelector('.crazy-drawer');
}
function drawerTitleEl() {
  return bySelector('.crazy-drawer__title');
}
function drawerBodyEl() {
  return bySelector('.crazy-drawer__body');
}
function drawerFooterEl() {
  return bySelector('.crazy-drawer__footer');
}
function drawerCloseEl() {
  return bySelector('.crazy-drawer__close');
}
function overlayEl() {
  return bySelector('.crazy-drawer-overlay');
}

describe('Drawer', () => {
  let wrappers: ReturnType<typeof mount>[] = [];

  beforeEach(() => {
    wrappers = [];
    document.body.innerHTML = '';
  });

  afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    wrappers = [];
    document.body.innerHTML = '';
  });

  function createDrawer(props = {}, slots = {}) {
    const w = mount(Drawer, { props: { modelValue: false, ...props }, slots });
    wrappers.push(w);
    return w;
  }

  // 1. Opens when modelValue is true
  it('renders when modelValue is true', async () => {
    createDrawer({ modelValue: true, title: 'Drawer Title' });
    await nextTick();
    expect(drawerEl()).toBeTruthy();
    expect(drawerTitleEl()?.textContent).toContain('Drawer Title');
  });

  // 2. Hidden when modelValue is false
  it('is hidden when modelValue is false', async () => {
    createDrawer({ modelValue: false });
    await nextTick();
    expect(drawerEl()).toBeFalsy();
  });

  // 3. Toggles visibility on modelValue change
  it('shows and hides when modelValue changes', async () => {
    const wrapper = createDrawer({ modelValue: false });
    await nextTick();
    expect(drawerEl()).toBeFalsy();

    await wrapper.setProps({ modelValue: true });
    await nextTick();
    expect(drawerEl()).toBeTruthy();

    await wrapper.setProps({ modelValue: false });
    await nextTick();
    expect(drawerEl()).toBeFalsy();
  });

  // 4. Renders title
  it('renders title prop', async () => {
    createDrawer({ modelValue: true, title: 'Settings' });
    await nextTick();
    expect(drawerTitleEl()?.textContent).toBe('Settings');
  });

  // 5. Hides header when showHeader is false
  it('hides header when showHeader is false', async () => {
    createDrawer({ modelValue: true, showHeader: false });
    await nextTick();
    expect(bySelector('.crazy-drawer__header')).toBeFalsy();
  });

  // 6. Default slot
  it('renders default slot content', async () => {
    createDrawer({ modelValue: true }, { default: 'Drawer body content' });
    await nextTick();
    expect(drawerBodyEl()?.textContent).toContain('Drawer body content');
  });

  // 7. Footer slot
  it('renders footer slot content', async () => {
    createDrawer({ modelValue: true }, { footer: 'Footer actions' });
    await nextTick();
    expect(drawerFooterEl()?.textContent).toContain('Footer actions');
  });

  // 8. No footer when no footer slot
  it('does not show footer when no footer slot', async () => {
    createDrawer({ modelValue: true });
    await nextTick();
    expect(drawerFooterEl()).toBeFalsy();
  });

  // 9. Direction applies correct class
  it('applies direction class', async () => {
    createDrawer({ modelValue: true, direction: 'left' });
    await nextTick();
    expect(drawerEl()?.classList.contains('is-left')).toBe(true);
  });

  it('applies bottom direction class', async () => {
    createDrawer({ modelValue: true, direction: 'bottom' });
    await nextTick();
    expect(drawerEl()?.classList.contains('is-bottom')).toBe(true);
  });

  it('defaults to right direction', async () => {
    createDrawer({ modelValue: true });
    await nextTick();
    expect(drawerEl()?.classList.contains('is-right')).toBe(true);
  });

  // 10. Width prop for left/right
  it('applies width style for left/right direction', async () => {
    createDrawer({ modelValue: true, direction: 'right', width: '500px' });
    await nextTick();
    expect(drawerEl()?.getAttribute('style')).toContain('500px');
  });

  // 11. Overlay click closes drawer
  it('closes when clicking overlay and closeOnClickModal is true', async () => {
    const wrapper = createDrawer({ modelValue: true, closeOnClickModal: true });
    await nextTick();
    const overlay = overlayEl();
    expect(overlay).toBeTruthy();
    overlay?.dispatchEvent(new MouseEvent('click'));
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  // 12. Overlay does not close when closeOnClickModal is false
  it('does not close when closeOnClickModal is false', async () => {
    const wrapper = createDrawer({ modelValue: true, closeOnClickModal: false });
    await nextTick();
    overlayEl()?.dispatchEvent(new MouseEvent('click'));
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  // 13. Close button closes drawer
  it('close button closes drawer when closable is true', async () => {
    const wrapper = createDrawer({ modelValue: true, closable: true });
    await nextTick();
    const closeBtn = drawerCloseEl();
    expect(closeBtn).toBeTruthy();
    closeBtn?.dispatchEvent(new MouseEvent('click'));
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  // 14. Hides close button when closable is false
  it('hides close button when closable is false', async () => {
    createDrawer({ modelValue: true, closable: false });
    await nextTick();
    expect(drawerCloseEl()).toBeFalsy();
  });

  // 15. Escape key closes drawer
  it('closes on Escape keydown when closeOnPressEscape is true', async () => {
    const wrapper = createDrawer({ modelValue: true, closeOnPressEscape: true });
    await nextTick();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  // 16. Does not close on Escape when closeOnPressEscape is false
  it('does not close on Escape when closeOnPressEscape is false', async () => {
    const wrapper = createDrawer({ modelValue: true, closeOnPressEscape: false });
    await nextTick();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  // 17. Emits open and close events
  it('emits open event when drawer opens', async () => {
    const wrapper = createDrawer({ modelValue: false });
    await nextTick();
    await wrapper.setProps({ modelValue: true });
    await nextTick();
    expect(wrapper.emitted('open')).toBeTruthy();
  });

  it('emits close event when drawer closes', async () => {
    const wrapper = createDrawer({ modelValue: true });
    await nextTick();
    await wrapper.setProps({ modelValue: false });
    await nextTick();
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  // 18. No overlay when modal is false
  it('does not show overlay when modal is false', async () => {
    createDrawer({ modelValue: true, modal: false });
    await nextTick();
    expect(overlayEl()).toBeFalsy();
  });

  // 19 Teleport
  it('teleports content to body', async () => {
    createDrawer({ modelValue: true });
    await nextTick();
    expect(drawerEl()).toBeTruthy();
  });
});
