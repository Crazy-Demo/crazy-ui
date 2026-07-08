<template>
  <Transition
    name="notification-fade"
    @after-leave="onAfterLeave"
  >
    <div
      v-if="visible"
      :class="[ns.b(), ns.m(type)]"
      :style="positionStyle"
      role="alert"
      @click="handleClick"
    >
      <span :class="ns.e('icon')">
        <span v-if="type === 'success'">&#10003;</span>
        <span v-else-if="type === 'warning'">&#9888;</span>
        <span v-else-if="type === 'error'">&#10007;</span>
        <span v-else>&#8505;</span>
      </span>
      <div :class="ns.e('content')">
        <p :class="ns.e('title')">{{ title }}</p>
        <p :class="ns.e('message')">
          <span v-if="dangerouslyUseHTMLString" v-html="message" />
          <template v-else>{{ message }}</template>
        </p>
      </div>
      <span
        v-if="showClose"
        :class="ns.e('close')"
        @click.stop="close"
      >&#10005;</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { notificationProps, notificationEmits } from './types';

const props = defineProps(notificationProps);
const emit = defineEmits(notificationEmits);
const ns = useNamespace('notification');

const visible = ref(true);
let timer: ReturnType<typeof setTimeout> | null = null;

const positionMap: Record<string, Record<string, string>> = {
  'top-right': { top: `${props.offset}px`, right: `${props.offset}px` },
  'top-left': { top: `${props.offset}px`, left: `${props.offset}px` },
  'bottom-right': { bottom: `${props.offset}px`, right: `${props.offset}px` },
  'bottom-left': { bottom: `${props.offset}px`, left: `${props.offset}px` },
};

const positionStyle = computed(() => positionMap[props.position] ?? positionMap['top-right']);

function close() {
  visible.value = false;
  emit('close');
}

function onAfterLeave() {
  props.onClose?.();
}

function handleClick() {
  props.onClick?.();
}

function startTimer() {
  if (props.duration > 0) {
    timer = setTimeout(close, props.duration);
  }
}

onMounted(() => {
  startTimer();
});
</script>
