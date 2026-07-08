<template>
  <div :class="ns.b()">
    <div :class="ns.e('image')" :style="imageStyle">
      <slot name="image">
        <svg
          v-if="!image"
          :class="ns.e('svg')"
          viewBox="0 0 64 41"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
            <ellipse :class="ns.e('ellipse')" cx="32" cy="33" rx="32" ry="7" />
            <g fill-rule="nonzero" stroke="#d9d9d9">
              <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" />
              <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 34 52.05 34h-40.1C10.32 34 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" />
            </g>
          </g>
        </svg>
        <img v-else :src="image" :class="ns.e('img')" alt="empty" />
      </slot>
    </div>
    <p :class="ns.e('description')">
      <slot name="description">{{ descriptionText }}</slot>
    </p>
    <div v-if="$slots.default" :class="ns.e('extra')">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { emptyProps } from './types';

const props = defineProps(emptyProps);
const ns = useNamespace('empty');

const descriptionText = computed(
  () => props.description ?? '暂无数据',
);
</script>
