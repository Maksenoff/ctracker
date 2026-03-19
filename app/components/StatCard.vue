<template>
  <div class="bg-gray-800 rounded-xl p-4 text-center">
    <div class="text-2xl mb-1">{{ icon }}</div>
    <div class="text-2xl font-bold text-white">{{ value }}</div>
    <div class="text-xs text-gray-400 mt-1">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string; value: string; label: string }>()
</script>
 