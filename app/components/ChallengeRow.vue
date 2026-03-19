<template>
  <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-700 transition-colors">
    <input
      type="checkbox"
      :checked="completed"
      @change="$emit('toggle', ($event.target as HTMLInputElement).checked)"
      class="w-5 h-5 accent-purple-500 cursor-pointer"
    />
    <span class="text-lg">{{ challengeType.icon }}</span>
    <div class="flex-1">
      <p class="font-medium text-sm">{{ challengeType.name }}</p>
      <p v-if="challengeType.description" class="text-xs text-gray-400">{{ challengeType.description }}</p>
    </div>
    <span v-if="completed" class="text-xs text-purple-400 font-semibold">Validé ✓</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{ challengeType: any; completed: boolean }>()
defineEmits(['toggle'])
</script>
