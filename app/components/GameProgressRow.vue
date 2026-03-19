<template>
  <NuxtLink
    :to="`/games/${game.game_id}`"
    class="block rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all cursor-pointer relative min-h-[100px]"
  >
    <!-- Image de fond -->
    <div class="absolute inset-0">
      <img v-if="game.cover_url" :src="game.cover_url" class="w-full h-full object-cover object-top" />
      <div v-else class="w-full h-full" :style="{ backgroundColor: avatarColor }" />
    </div>

    <!-- Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

    <!-- Contenu -->
    <div class="relative p-3 flex flex-col min-h-[100px]">
      <div class="flex items-start justify-between mb-auto">
        <span
          v-if="game.completion_percentage >= 100"
          class="text-xs bg-purple-600/80 text-white px-2 py-0.5 rounded-full font-medium"
        >✓ Terminé</span>
        <span v-else class="text-xs bg-black/40 text-gray-300 px-2 py-0.5 rounded-full">{{ game.completion_percentage }}%</span>
      </div>
      <div class="mt-auto">
        <p class="font-bold text-white text-sm drop-shadow truncate mb-1.5">{{ game.game_name }}</p>
        <div class="w-full bg-white/20 rounded-full h-1">
          <div class="bg-purple-400 h-1 rounded-full transition-all" :style="{ width: `${game.completion_percentage}%` }" />
        </div>
        <p class="text-xs text-white/50 mt-1">{{ game.completed_bosses }}/{{ game.total_bosses }} boss · {{ game.total_challenges_done }} défis</p>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ game: any }>()

const colors = ['#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0284c7', '#9333ea', '#c026d3']
const avatarColor = computed(() => colors[(props.game.game_name?.charCodeAt(0) ?? 0) % colors.length])
</script>
