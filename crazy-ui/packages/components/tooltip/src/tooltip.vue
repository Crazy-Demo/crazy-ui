<template>
  <div
    ref="triggerRef"
    :class="ns.b()"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <slot />
    <Transition name="tooltip-fade">
      <div
        v-if="visible"
        ref="tooltipRef"
        :class="[ns.e('content'), ns.em('content', placement)]"
        :style="contentStyle"
        role="tooltip"
      >
        {{ content }}
        <div :class="ns.e('arrow')" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount } from 'vue';
import {
  useNamespace,
  useZIndex,
  usePosition,
} from '@crazy-ui/hooks';
import { tooltipProps } from './types';

const props = defineProps(tooltipProps);
const ns = useNamespace('tooltip');

const triggerRef = ref<HTMLElement>();
const tooltipRef = ref<HTMLElement>();
const visible = ref(false);
const { nextZIndex } = useZIndex();
const internalZIndex = ref(0);

const { position, update: updatePosition } = usePosition({
  anchor: triggerRef,
  floating: tooltipRef,
  placement: computed(() => props.placement),
  offset: computed(() => props.offset),
});

const contentStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  zIndex: internalZIndex.value,
}));

let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function show() {
  if (props.disabled) return;
  clearTimers();
  if (props.showAfter > 0) {
    showTimer = setTimeout(() => {
      visible.value = true;
      internalZIndex.value = nextZIndex();
      nextTick(() => updatePosition());
    }, props.showAfter);
  } else {
    visible.value = true;
    internalZIndex.value = nextZIndex();
    nextTick(() => updatePosition());
  }
}

function hide() {
  clearTimers();
  if (props.hideAfter > 0) {
    hideTimer = setTimeout(() => {
      visible.value = false;
    }, props.hideAfter);
  } else {
    visible.value = false;
  }
}

function onMouseEnter() {
  if (props.trigger === 'hover') show();
}

function onMouseLeave() {
  if (props.trigger === 'hover') hide();
}

function onClick() {
  if (props.trigger === 'click') {
    if (visible.value) {
      hide();
    } else {
      show();
    }
  }
}

onBeforeUnmount(() => clearTimers());
</script>
