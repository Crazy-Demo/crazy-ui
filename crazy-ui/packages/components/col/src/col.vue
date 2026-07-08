<template>
  <component
    :is="tag"
    :class="classes"
    :style="colStyle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { colProps } from './types';
import { rowInjectionKey } from '../../row/src/types';

const props = defineProps(colProps);
const ns = useNamespace('col');
const rowContext = inject(rowInjectionKey, null);

const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

function getSpan(prop: number | { span?: number } | undefined, field: string): number | undefined {
  if (prop === undefined) return undefined;
  if (typeof prop === 'number') {
    return field === 'span' ? prop : undefined;
  }
  return (prop as any)[field];
}

const classes = computed(() => {
  const cls: string[] = [ns.b()];

  // Base
  if (props.span !== 24) cls.push(ns.m(`span-${props.span}`));
  if (props.offset > 0) cls.push(ns.m(`offset-${props.offset}`));
  if (props.push > 0) cls.push(ns.m(`push-${props.push}`));
  if (props.pull > 0) cls.push(ns.m(`pull-${props.pull}`));

  // Responsive
  for (const bp of BREAKPOINTS) {
    const val = props[bp];
    if (val === undefined) continue;

    const span = getSpan(val, 'span');
    const offset = getSpan(val, 'offset');
    const push = getSpan(val, 'push');
    const pull = getSpan(val, 'pull');

    if (span !== undefined) cls.push(ns.m(`${bp}-${span}`));
    if (offset !== undefined && offset > 0) cls.push(ns.m(`${bp}-offset-${offset}`));
    if (push !== undefined && push > 0) cls.push(ns.m(`${bp}-push-${push}`));
    if (pull !== undefined && pull > 0) cls.push(ns.m(`${bp}-pull-${pull}`));
  }

  return cls;
});

const colStyle = computed(() => {
  const style: Record<string, string> = {};

  if (rowContext && rowContext.gutter > 0) {
    const half = `${rowContext.gutter / 2}px`;
    style.paddingLeft = half;
    style.paddingRight = half;
  }

  if (props.flex !== undefined) {
    style.flex = typeof props.flex === 'number' ? `${props.flex}` : props.flex;
  }

  return style;
});
</script>
