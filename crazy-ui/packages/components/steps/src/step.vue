<template>
  <div :class="[ns.b(), ns.is(currentStatus, true)]">
    <div :class="ns.e('indicator')">
      <span v-if="currentStatus === 'finish'" :class="ns.e('icon')">&#10003;</span>
      <span v-else-if="currentStatus === 'error'" :class="ns.e('icon')">&#10005;</span>
      <span v-else :class="ns.e('number')">{{ stepIndex + 1 }}</span>
    </div>
    <div :class="ns.e('content')">
      <div :class="ns.e('title')">{{ title }}</div>
      <div v-if="description" :class="ns.e('description')">{{ description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, getCurrentInstance } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { stepProps, type StepsContext, type StepStatus } from './types';

const props = defineProps(stepProps);
const ns = useNamespace('step');

const ctx = inject<StepsContext>('stepsContext')!;
const instance = getCurrentInstance();

const stepIndex = computed(() => {
  if (props.index !== undefined) return props.index;
  // Fallback: try to detect index from parent slots
  if (!instance?.parent) return 0;
  const defaultSlot = instance.parent.slots?.default;
  if (!defaultSlot) return 0;
  const vnodes = defaultSlot();
  const idx = vnodes.findIndex(
    (vnode: any) => vnode?.component?.uid === instance.uid,
  );
  return idx >= 0 ? idx : 0;
});

const currentStatus = computed<StepStatus>(() => {
  if (props.status) return props.status as StepStatus;
  if (stepIndex.value < ctx.active.value) return ctx.finishStatus.value;
  if (stepIndex.value === ctx.active.value) return 'process';
  return 'wait';
});
</script>
