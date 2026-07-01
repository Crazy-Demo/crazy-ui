import { ref } from 'vue';

export function useComposition() {
  const isComposing = ref(false);

  function handleCompositionStart() {
    isComposing.value = true;
  }

  function handleCompositionEnd(event: CompositionEvent) {
    isComposing.value = false;
  }

  return {
    isComposing,
    handleCompositionStart,
    handleCompositionEnd,
  };
}
