<template>
  <aside
    :class="[ns.b(), { 'is-collapsed': isCollapsed }]"
    :style="siderStyle"
  >
    <div :class="ns.e('inner')">
      <slot />
    </div>
    <div
      v-if="collapsible"
      :class="ns.e('trigger')"
      @click="toggleCollapse"
    >
      <slot name="trigger">
        <span>{{ isCollapsed ? '&#9654;' : '&#9664;' }}</span>
      </slot>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { siderProps, siderEmits, layoutHasSiderKey } from './types';

const props = defineProps(siderProps);
const emit = defineEmits(siderEmits);
const ns = useNamespace('layout-sider');

const hasSider = inject(layoutHasSiderKey, null);
if (hasSider) hasSider.value = true;

const _collapsed = ref(props.defaultCollapsed);

onMounted(() => {
  if (props.collapsed !== undefined) {
    _collapsed.value = props.collapsed;
  }
});

const isCollapsed = computed(() =>
  props.collapsed !== undefined ? props.collapsed : _collapsed.value,
);

const currentWidth = computed(() =>
  isCollapsed.value ? pxValue(props.collapsedWidth) : pxValue(props.width),
);

const siderStyle = computed(() => ({
  width: currentWidth.value,
  minWidth: currentWidth.value,
  maxWidth: currentWidth.value,
  flex: `0 0 ${currentWidth.value}`,
}));

function pxValue(v: string | number): string {
  return typeof v === 'number' ? `${v}px` : v;
}

function toggleCollapse() {
  const newVal = !isCollapsed.value;
  _collapsed.value = newVal;
  emit('update:collapsed', newVal);
}
</script>
