<template>
  <Transition name="loading-fade">
    <div
      v-if="loading"
      :class="[ns.b(), { 'is-fullscreen': fullscreen }]"
      :style="{ backgroundColor: background }"
    >
      <div v-if="spinner" :class="ns.e('spinner')">
        <svg :class="ns.e('circular')" viewBox="25 25 50 50">
          <circle cx="50" cy="50" r="20" fill="none" />
        </svg>
      </div>
      <p v-if="text" :class="ns.e('text')">{{ text }}</p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useNamespace } from '@crazy-ui/hooks';
import { loadingProps } from './props';

const props = defineProps(loadingProps);
const ns = useNamespace('loading');
</script>
