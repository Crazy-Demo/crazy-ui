<template>
  <ul
    :class="[
      ns.b(),
      ns.m(mode),
      { 'is-collapse': collapse },
    ]"
    :style="menuStyle"
    role="menu"
    :aria-orientation="mode === 'horizontal' ? 'horizontal' : 'vertical'"
  >
    <slot />
  </ul>
</template>

<script setup lang="ts">
import { ref, computed, provide, toRef, watch } from 'vue';
import { useNamespace, useControllable } from '@crazy-ui/hooks';
import { menuProps, menuEmits } from './types';
import { menuInjectionKey } from './context';

const props = defineProps(menuProps);
const emit = defineEmits(menuEmits);
const ns = useNamespace('menu');

const active = useControllable<string | number>({
  value: toRef(props, 'active'),
  defaultValue: toRef(props, 'defaultActive'),
  onChange: (v) => emit('update:active', v),
  fallback: '',
});

const openedSubMenus = ref<Set<string | number>>(new Set());

function selectItem(index: string | number) {
  active.value = index;
  emit('change', index);
  emit('select', index);
}

function openSubMenu(index: string | number) {
  if (props.uniqueOpened) {
    openedSubMenus.value = new Set([index]);
  } else {
    const s = new Set(openedSubMenus.value);
    s.add(index);
    openedSubMenus.value = s;
  }
  emit('open', index);
}

function closeSubMenu(index: string | number) {
  const s = new Set(openedSubMenus.value);
  s.delete(index);
  openedSubMenus.value = s;
  emit('close', index);
}

provide(menuInjectionKey, {
  active,
  mode: toRef(props, 'mode'),
  collapse: toRef(props, 'collapse'),
  uniqueOpened: toRef(props, 'uniqueOpened'),
  subMenuTrigger: toRef(props, 'subMenuTrigger'),
  openedSubMenus,
  registerItem: () => {},
  unregisterItem: () => {},
  selectItem,
  openSubMenu,
  closeSubMenu,
  backgroundColor: toRef(props, 'backgroundColor'),
  textColor: toRef(props, 'textColor'),
  activeTextColor: toRef(props, 'activeTextColor'),
});

const menuStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.backgroundColor) s['background-color'] = props.backgroundColor;
  if (props.textColor) s['color'] = props.textColor;
  return s;
});
</script>
