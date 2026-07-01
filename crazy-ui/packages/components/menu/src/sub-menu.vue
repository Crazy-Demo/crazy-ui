<template>
  <li
    :class="[
      ns.b(),
      {
        'is-active': isActive,
        'is-opened': isOpened,
        'is-disabled': disabled,
      },
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div :class="ns.e('title')" @click="handleTitleClick">
      <slot name="title" />
      <span :class="[ns.e('arrow'), { 'is-open': isOpened }]">&#9654;</span>
    </div>
    <ul v-show="isOpened" :class="ns.e('children')" role="menu">
      <slot />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, inject, provide } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { subMenuProps } from './types';
import { menuInjectionKey, subMenuInjectionKey } from './context';

const props = defineProps(subMenuProps);
const ns = useNamespace('sub-menu');
const menu = inject(menuInjectionKey)!;

const isOpened = computed(() => menu.openedSubMenus.value.has(props.index));
const isActive = computed(() => menu.active.value === props.index);

let openTimer: ReturnType<typeof setTimeout> | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (openTimer) { clearTimeout(openTimer); openTimer = null; }
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
}

function handleMouseEnter() {
  if (menu.subMenuTrigger.value !== 'hover') return;
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  openTimer = setTimeout(() => menu.openSubMenu(props.index), props.showTimeout);
}

function handleMouseLeave() {
  if (menu.subMenuTrigger.value !== 'hover') return;
  if (openTimer) { clearTimeout(openTimer); openTimer = null; }
  closeTimer = setTimeout(() => menu.closeSubMenu(props.index), props.hideTimeout);
}

function handleTitleClick() {
  if (props.disabled) return;
  if (menu.subMenuTrigger.value === 'click') {
    isOpened.value ? menu.closeSubMenu(props.index) : menu.openSubMenu(props.index);
  }
}

provide(subMenuInjectionKey, {
  parentIndex: props.index,
  level: 1,
});
</script>
