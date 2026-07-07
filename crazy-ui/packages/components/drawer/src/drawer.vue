<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="drawer-fade">
      <div v-if="visible && modal" :class="ns.b() + '-overlay'" @click="onOverlayClick" />
    </Transition>
    <!-- Panel -->
    <Transition :name="`drawer-slide-${direction}`">
      <div
        v-if="visible"
        ref="drawerRef"
        :class="drawerClass"
        :style="panelStyle"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div v-if="showHeader" :class="ns.e('header')">
          <span :class="ns.e('title')">{{ title }}</span>
          <button v-if="closable" :class="ns.e('close')" @click="handleClose">&#x2715;</button>
        </div>
        <div :class="ns.e('body')"><slot /></div>
        <div v-if="$slots.footer" :class="ns.e('footer')"><slot name="footer" /></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useNamespace, useZIndex, useEscapeKey, useScrollLock } from '@crazy-ui/hooks';
import { drawerProps } from './types';

defineOptions({ name: 'Drawer' });

const props = defineProps(drawerProps);
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  open: [];
  close: [];
}>();

const ns = useNamespace('drawer');
const { nextZIndex } = useZIndex();
const drawerRef = ref<HTMLElement>();
const visible = ref(false);
const zIndex = ref(0);

const drawerClass = computed(() => [
  ns.b(),
  {
    'is-left': props.direction === 'left',
    'is-right': props.direction === 'right',
    'is-top': props.direction === 'top',
    'is-bottom': props.direction === 'bottom',
  },
]);

watch(
  () => props.modelValue,
  (val) => {
    if (val) open();
    else close();
  },
  { immediate: true }
);

function open() {
  visible.value = true;
  zIndex.value = nextZIndex();
  emit('open');
}

function close() {
  visible.value = false;
  emit('close');
  emit('update:modelValue', false);
}

function handleClose() {
  close();
}

function onOverlayClick() {
  if (props.closeOnClickModal) {
    handleClose();
  }
}

const sizeMap: Record<string, string> = {
  left: 'width',
  right: 'width',
  top: 'height',
  bottom: 'height',
};

const panelStyle = computed(() => ({
  [sizeMap[props.direction]]:
    props.direction === 'left' || props.direction === 'right' ? props.width : '300px',
  zIndex: zIndex.value,
}));

useScrollLock({ locked: visible });

useEscapeKey({
  enabled: computed(() => visible.value && props.closeOnPressEscape),
  onEscape: handleClose,
});
</script>
