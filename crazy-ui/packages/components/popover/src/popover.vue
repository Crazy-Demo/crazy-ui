<template>
  <div
    ref="triggerRef"
    :class="ns.b()"
    @click="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div ref="triggerEl">
      <slot name="trigger" />
    </div>
    <Transition name="popover-fade">
      <div
        v-if="_visible"
        ref="popoverRef"
        :class="ns.e('content')"
        :style="contentStyle"
        role="dialog"
        @mouseenter="onContentEnter"
        @mouseleave="onContentLeave"
      >
        <slot />
        <div v-if="showArrow" :class="ns.e('arrow')" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import {
  useNamespace,
  useZIndex,
  usePosition,
  useClickOutside,
} from '@crazy-ui/hooks';
import { popoverProps, popoverEmits } from './types';

const props = defineProps(popoverProps);
const emit = defineEmits(popoverEmits);

const ns = useNamespace('popover');
const { nextZIndex } = useZIndex();

const triggerRef = ref<HTMLElement>();
const popoverRef = ref<HTMLElement>();
const triggerEl = ref<HTMLElement>();
const _visible = ref(props.visible ?? false);
const internalZIndex = ref(0);

const isControlled = computed(() => props.visible !== undefined);

watch(
  () => props.visible,
  (v) => {
    if (v !== undefined) _visible.value = v;
  },
);

const { position, update: updatePosition } = usePosition({
  anchor: triggerEl,
  floating: popoverRef,
  placement: computed(() => props.placement),
  offset: computed(() => props.offset),
});

const contentStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  zIndex: internalZIndex.value,
  width: props.width
    ? typeof props.width === 'number'
      ? `${props.width}px`
      : props.width
    : undefined,
}));

function show() {
  if (props.disabled) return;
  _visible.value = true;
  internalZIndex.value = nextZIndex();
  nextTick(() => updatePosition());
  if (isControlled.value) emit('update:visible', true);
  emit('show');
}

function hide() {
  _visible.value = false;
  if (isControlled.value) emit('update:visible', false);
  emit('hide');
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

function onContentEnter() {
  if (props.trigger === 'hover') show();
}

function onContentLeave() {
  if (props.trigger === 'hover') hide();
}

useClickOutside({
  target: popoverRef,
  exclude: triggerRef,
  handler: () => hide(),
});
</script>
