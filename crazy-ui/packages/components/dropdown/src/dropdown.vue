<template>
  <div
    ref="triggerRef"
    :class="ns.b()"
    @click="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div ref="triggerEl">
      <slot />
    </div>
    <Transition name="dropdown-fade">
      <div
        v-if="_visible"
        ref="dropdownRef"
        :class="ns.e('menu')"
        :style="menuStyle"
        role="menu"
        @click.stop="onItemClick"
      >
        <slot name="dropdown" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  useNamespace,
  useZIndex,
  usePosition,
  useClickOutside,
} from '@crazy-ui/hooks';
import { dropdownProps, dropdownEmits } from './types';

const props = defineProps(dropdownProps);
const emit = defineEmits(dropdownEmits);

const ns = useNamespace('dropdown');
const { nextZIndex } = useZIndex();

const triggerRef = ref<HTMLElement>();
const triggerEl = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const _visible = ref(props.modelValue ?? false);
const zIndex = ref(0);

const isControlled = computed(() => props.modelValue !== undefined);

watch(
  () => props.modelValue,
  (v) => {
    _visible.value = v;
  },
);

const { position } = usePosition({
  anchor: triggerEl,
  floating: dropdownRef,
  placement: computed(() => props.placement),
});

const menuStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  zIndex: zIndex.value,
}));

function show() {
  if (props.disabled) return;
  _visible.value = true;
  zIndex.value = nextZIndex();
  if (isControlled.value) emit('update:modelValue', true);
  emit('visible-change', true);
}

function hide() {
  _visible.value = false;
  if (isControlled.value) emit('update:modelValue', false);
  emit('visible-change', false);
}

function toggle() {
  _visible.value ? hide() : show();
}

function onClick() {
  if (props.trigger === 'click') toggle();
}

function onMouseEnter() {
  if (props.trigger === 'hover') show();
}

function onMouseLeave() {
  if (props.trigger === 'hover') hide();
}

function onItemClick() {
  if (props.hideOnClick) hide();
}

useClickOutside({
  target: dropdownRef,
  exclude: triggerRef,
  handler: hide,
});
</script>
