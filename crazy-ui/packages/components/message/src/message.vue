<template>
  <Transition
    name="message-fade"
    @after-leave="onAfterLeave"
  >
    <div
      v-if="visible"
      :class="[ns.b(), ns.m(type), { 'is-center': center }]"
      :style="{ top: `${offset}px` }"
      role="alert"
    >
      <span :class="ns.e('icon')">
        <span v-if="type === 'success'">&#10003;</span>
        <span v-else-if="type === 'warning'">&#9888;</span>
        <span v-else-if="type === 'error'">&#10007;</span>
        <span v-else>&#8505;</span>
      </span>
      <p :class="ns.e('content')">
        <span v-if="dangerouslyUseHTMLString" v-html="message" />
        <template v-else>{{ message }}</template>
      </p>
      <span
        v-if="showClose"
        :class="ns.e('close')"
        @click="close"
      >&#10005;</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { messageProps, messageEmits } from './types';

const props = defineProps(messageProps);
const emit = defineEmits(messageEmits);
const ns = useNamespace('message');

const visible = ref(true);
let timer: ReturnType<typeof setTimeout> | null = null;

function close() {
  visible.value = false;
  emit('close');
}

function onAfterLeave() {
  props.onClose?.();
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
