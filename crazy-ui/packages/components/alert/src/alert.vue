<template>
  <Transition name="alert-fade">
    <div
      v-if="visible"
      :class="[
        ns.b(),
        ns.m(type),
        ns.m(effect),
        {
          'is-center': center,
        },
      ]"
      role="alert"
    >
      <span v-if="showIcon" :class="ns.e('icon')">
        <slot name="icon">
          <span v-if="type === 'success'">&#10003;</span>
          <span v-else-if="type === 'warning'">&#9888;</span>
          <span v-else-if="type === 'error'">&#10007;</span>
          <span v-else>&#8505;</span>
        </slot>
      </span>
      <div :class="ns.e('content')">
        <span v-if="title" :class="ns.e('title')">
          <slot name="title">{{ title }}</slot>
        </span>
        <p v-if="description || $slots.default" :class="ns.e('description')">
          <slot>{{ description }}</slot>
        </p>
      </div>
      <span
        v-if="closable"
        :class="ns.e('close')"
        role="button"
        tabindex="0"
        @click="handleClose"
        @keydown.enter="handleClose"
      >
        <slot name="close">
          {{ closeText || '&#10005;' }}
        </slot>
      </span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { alertProps, alertEmits } from './types';

const props = defineProps(alertProps);
const emit = defineEmits(alertEmits);
const ns = useNamespace('alert');

const visible = ref(true);

function handleClose(event: MouseEvent) {
  visible.value = false;
  emit('close', event);
}
</script>
