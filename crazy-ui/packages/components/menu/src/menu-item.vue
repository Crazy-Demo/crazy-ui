<template>
  <li
    :class="[
      ns.e('item'),
      {
        'is-active': isActive,
        'is-disabled': disabled,
      },
    ]"
    :style="itemStyle"
    role="menuitem"
    :aria-disabled="disabled || undefined"
    @click="handleClick"
  >
    <slot />
  </li>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useNamespace, useRouterLink } from '@crazy-ui/hooks';
import { menuItemProps, menuItemEmits } from './types';
import { menuInjectionKey } from './context';

const props = defineProps(menuItemProps);
const emit = defineEmits(menuItemEmits);
const ns = useNamespace('menu');
const menu = inject(menuInjectionKey)!;

const isActive = computed(() => menu.active.value === props.index);

const itemStyle = computed(() => {
  if (isActive.value && menu.activeTextColor.value) {
    return { color: menu.activeTextColor.value };
  }
  return undefined;
});

const { navigate } = useRouterLink({
  to: computed(() => props.to),
  replace: computed(() => props.replace),
});

function handleClick(event: MouseEvent) {
  if (props.disabled) return;
  menu.selectItem(props.index);
  navigate();
  emit('click', event);
}
</script>
