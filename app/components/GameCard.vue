<template>
  <NuxtLink
    :to="`/games/${game.game_id}`"
    class="block rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all cursor-pointer relative min-h-[130px]"
  >
    <!-- Image de fond -->
    <div class="absolute inset-0">
      <img
        v-if="game.cover_url"
        :src="game.cover_url"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full" :style="{ backgroundColor: avatarColor }" />
    </div>

    <!-- Overlay gradient pour lisibilité -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

    <!-- Contenu par-dessus -->
    <div class="relative p-4 flex flex-col h-full min-h-[130px]">
      <div class="flex justify-between mb-auto">
        <!-- Badge favori -->
        <button v-if="showFavorite" @click.prevent="$emit('setFavorite')" :title="game.is_favorite ? 'Retirer des favoris' : 'Jeu favori'"
          :class="['transition-all', game.is_favorite ? 'text-pink-400 drop-shadow scale-110' : 'text-white/30 hover:text-pink-400']">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
        <span v-else-if="game.is_favorite" class="text-pink-400 text-2xl leading-none drop-shadow">♥</span>
        <span v-else />

        <button @click.prevent="$emit('delete')" title="Supprimer"
          class="p-1 rounded-lg bg-black/40 text-gray-300 hover:text-red-400 hover:bg-black/60 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Infos en bas -->
      <div class="mt-auto">
        <p class="font-bold text-base text-white truncate drop-shadow mb-2">{{ game.game_name }}</p>
        <div class="w-full bg-white/20 rounded-full h-1.5 mb-1.5">
          <div class="bg-purple-400 h-1.5 rounded-full transition-all" :style="{ width: `${game.completion_percentage}%` }" />
        </div>
        <div class="flex justify-between text-xs text-white/70">
          <span>{{ game.completed_bosses }}/{{ game.total_bosses }} boss · {{ game.total_challenges_done }} défis</span>
          <span class="text-purple-300 font-semibold">{{ game.completion_percentage }}%</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ game: any; showFavorite?: boolean }>()
defineEmits(['delete', 'setFavorite'])

const colors = ['#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0284c7', '#9333ea', '#c026d3']
const avatarColor = computed(() => colors[props.game.game_name.charCodeAt(0) % colors.length])
</script>
