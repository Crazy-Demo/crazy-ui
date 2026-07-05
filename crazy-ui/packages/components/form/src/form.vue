<template>
  <form :class="[ns.b(), { 'is-inline': props.inline }]" @submit="handleSubmit">
    <slot />
  </form>
</template>

<script setup lang="ts">
import { useForm } from './use-form';
import { formProps, formEmits } from './types';

const props = defineProps(formProps);
const emit = defineEmits(formEmits);

const { ns, handleSubmit, validate, clearValidate, resetFields } = useForm(props, emit);

defineExpose({ validate, clearValidate, resetFields });
</script>
