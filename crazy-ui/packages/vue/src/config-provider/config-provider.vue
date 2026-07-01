<template>
  <slot />
</template>

<script setup lang="ts">
import { ref, provide, type InjectionKey } from 'vue';
import {
  namespaceInjectionKey,
  sizeInjectionKey,
  zIndexCounterInjectionKey,
  localeInjectionKey,
  teleportInjectionKey,
} from '@crazy-ui/core';
import type { ComponentSize } from '@crazy-ui/core';

const props = withDefaults(defineProps<{
  namespace?: string;
  size?: ComponentSize;
  zIndex?: number;
  locale?: Record<string, unknown>;
  teleportTo?: string | HTMLElement;
}>(), {
  namespace: 'crazy',
  size: 'medium',
  zIndex: 2000,
  teleportTo: 'body',
});

const zIndexCounter = ref(props.zIndex);

provide(namespaceInjectionKey as unknown as InjectionKey<string>, props.namespace);
provide(sizeInjectionKey as unknown as InjectionKey<ComponentSize>, props.size);
provide(zIndexCounterInjectionKey as unknown as InjectionKey<Ref<number>>, zIndexCounter);
provide(localeInjectionKey as unknown as InjectionKey<Record<string, unknown>>, props.locale ?? {});
provide(teleportInjectionKey as unknown as InjectionKey<string | HTMLElement>, props.teleportTo);
</script>
