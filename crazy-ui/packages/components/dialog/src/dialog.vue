<template>
  <Teleport to="body">
    <!-- Overlay mask -->
    <Transition name="dialog-fade">
      <div v-if="visible" :class="ns.b() + '-overlay'" @click="onOverlayClick" />
    </Transition>
    <!-- Dialog box -->
    <Transition name="dialog-zoom">
      <div
        v-if="visible"
        ref="dialogRef"
        :class="[ns.b(), { 'is-fullscreen': fullscreen }]"
        :style="{ width: fullscreen ? '100%' : width, zIndex: zIndex + 1 }"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <!-- Header -->
        <div v-if="showHeader" :class="ns.e('header')">
          <span :class="ns.e('title')">{{ title }}</span>
          <button v-if="closable" :class="ns.e('close')" @click="handleClose">
            &#x2715;
          </button>
        </div>
        <!-- Body -->
        <div :class="ns.e('body')">
          <slot />
        </div>
        <!-- Footer -->
        <div v-if="showFooter" :class="ns.e('footer')">
          <slot name="footer">
            <Button @click="handleCancel">{{ cancelText }}</Button>
            <Button
              variant="solid"
              color="primary"
              @click="handleConfirm"
              style="margin-left: 8px"
            >
              {{ confirmText }}
            </Button>
          </slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, type Ref } from 'vue';
import {
  useNamespace,
  useZIndex,
  useClickOutside,
  useEscapeKey,
  useFocusTrap,
  useScrollLock,
} from '@crazy-ui/hooks';
import { dialogProps } from './types';
import { Button } from '../../button';

const props = defineProps(dialogProps);
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  open: [];
  close: [];
  confirm: [];
  cancel: [];
}>();

const ns = useNamespace('dialog');
const { nextZIndex } = useZIndex();
const dialogRef = ref<HTMLElement>();
const visible = ref(false);
const zIndex = ref(0);

// Focus trap — activated/deactivated manually
const focusTrap = useFocusTrap({
  containerRef: dialogRef as Ref<HTMLElement | undefined>,
  enabled: visible,
});

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
  nextTick(() => {
    focusTrap.activate();
  });
}

function close() {
  focusTrap.deactivate();
  visible.value = false;
  emit('close');
  emit('update:modelValue', false);
}

function handleClose() {
  if (props.beforeClose) {
    props.beforeClose(close);
  } else {
    close();
  }
}

function handleConfirm() {
  emit('confirm');
  close();
}

function handleCancel() {
  emit('cancel');
  close();
}

function onOverlayClick() {
  if (props.closeOnClickModal && props.modal) {
    handleClose();
  }
}

useScrollLock({ locked: visible });

useEscapeKey({
  enabled: computed(() => visible.value && props.closeOnPressEscape),
  onEscape: handleClose,
});

useClickOutside({
  target: dialogRef as Ref<HTMLElement | undefined>,
  handler: () => {
    if (props.closeOnClickModal && props.modal) handleClose();
  },
});
</script>
