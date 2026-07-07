<template>
  <div :class="[ns.b(), ns.m(status || '')]">
    <div
      :class="ns.e('bar')"
      role="progressbar"
      :aria-valuenow="percentage"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        :class="ns.e('inner')"
        :style="{
          width: `${clampedPercentage}%`,
          height: `${strokeWidth}px`,
          backgroundColor: barColor,
        }"
      />
    </div>
    <span v-if="showText" :class="ns.e('text')">
      <template v-if="status === 'success'">&#10003;</template>
      <template v-else-if="status === 'exception'">&#10005;</template>
      <template v-else>{{ percentage }}%</template>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { progressProps } from './types';

const props = defineProps(progressProps);
const ns = useNamespace('progress');

const clampedPercentage = computed(() =>
  Math.min(100, Math.max(0, props.percentage)),
);

const statusColors: Record<string, string> = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  exception: 'var(--color-danger)',
};

const barColor = computed(
  () =>
    props.color ||
    (props.status ? statusColors[props.status] : 'var(--color-primary)'),
);
</script>
