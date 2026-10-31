<script setup>
import TransformationStudio from './TransformationStudio.vue';

defineProps({
  scan: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['select-issue']);
</script>

<template>
  <TransformationStudio
    :scan="scan"
    @select-issue="(issue) => emit('select-issue', issue)"
  />
</template>
