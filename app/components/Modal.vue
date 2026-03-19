<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
      <div class="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h3 class="font-semibold text-lg">
            <slot name="title" />
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        <div class="p-5">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineEmits(['close'])
</script>
