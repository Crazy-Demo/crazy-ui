<template>
  <section :class="[ns.b(), { [ns.m('has-sider')]: hasSider }]">
    <slot />
  </section>
</template>

<script setup lang="ts">
import { inject, ref, provide } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { layoutHasSiderKey } from './types';

const ns = useNamespace('layout');

const hasSider = inject(layoutHasSiderKey, ref(false));
provide(layoutHasSiderKey, hasSider);
</script>
