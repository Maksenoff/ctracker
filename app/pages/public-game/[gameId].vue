<template>
  <div>
    <div v-if="loading" class="text-gray-400">Chargement...</div>
    <div v-else-if="gameError" class="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-400 text-sm">Erreur : {{ gameError.message }}</div>
    <div v-else-if="!gameData" class="text-center py-16 text-gray-500">Jeu introuvable.</div>
    <div v-else>

      <!-- Header image de fond -->
      <div class="relative rounded-xl overflow-hidden mb-6 min-h-[260px]">
        <div class="absolute inset-0">
          <img v-if="gameData.cover_url" :src="gameData.cover_url"
            class="w-full h-full object-cover" :style="{ objectPosition: gameData.image_position ?? 'center center' }" />
          <div v-else class="w-full h-full flex items-center justify-center text-6xl font-black text-white/20"
            :style="{ backgroundColor: gameColor(gameData.name) }" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
        <div class="relative p-6 flex flex-col min-h-[260px]">
          <NuxtLink :to="backLink" class="text-gray-300 hover:text-white text-sm mb-auto self-start">
            ← Retour au profil
          </NuxtLink>
          <div class="mt-auto">
            <h1 class="text-3xl font-bold text-white drop-shadow mb-2">{{ gameData.name }}</h1>
            <div v-if="gameStats" class="max-w-xs">
              <div class="flex justify-between text-xs text-gray-300 mb-1">
                <span>{{ gameStats.completed_bosses }}/{{ gameStats.total_bosses }} boss complétés</span>
                <span class="text-purple-300 font-medium">{{ gameStats.completion_percentage }}%</span>
              </div>
              <div class="w-full bg-white/10 rounded-full h-1.5">
                <div class="bg-purple-500 h-1.5 rounded-full" :style="{ width: `${gameStats.completion_percentage}%` }" />
              </div>
              <p class="text-xs text-gray-400 mt-1">{{ gameStats.total_challenges_done }} défis validés</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des boss -->
      <div v-if="bosses.length === 0" class="text-center py-12 text-gray-500">Aucun boss ajouté.</div>
      <div v-else class="space-y-3">
        <div v-for="boss in bosses" :key="boss.id"
          class="bg-gray-800 rounded-xl overflow-hidden flex items-center gap-4 p-3 relative">
          <!-- Image boss -->
          <div class="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
            <img v-if="boss.image_url" :src="boss.image_url" class="w-full h-full object-cover"
              :style="{ objectPosition: boss.image_position ?? 'center center' }" />
            <div v-else class="w-full h-full flex items-center justify-center text-lg font-black text-white/40"
              :style="{ backgroundColor: bossColor(boss.name) }">
              {{ boss.name?.[0]?.toUpperCase() }}
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-semibold text-white truncate">{{ boss.name }}</p>
              <span v-if="boss.is_featured" class="text-yellow-400 text-xs">⭐</span>
              <span v-if="boss.boss_runs?.[0]?.completed"
                class="text-xs bg-purple-600/50 text-purple-300 px-2 py-0.5 rounded-full">✓ Complété</span>
            </div>
            <p v-if="boss.boss_runs?.[0]" class="text-xs text-gray-400 mt-0.5">
              {{ boss.boss_runs[0].attempts ?? 0 }} essais
              <span v-if="boss.boss_runs[0].best_time_seconds"> · {{ formatTime(boss.boss_runs[0].best_time_seconds) }}</span>
            </p>
          </div>

          <!-- Badges défis -->
          <div class="flex flex-wrap gap-1 justify-end max-w-[100px]">
            <template v-if="boss.boss_runs?.[0]?.challenge_completions">
              <div v-for="cc in boss.boss_runs[0].challenge_completions.filter((c: any) => c.completed)"
                :key="cc.challenge_type?.name" class="relative group">
                <span class="text-base cursor-default">{{ cc.challenge_type?.icon }}</span>
                <div class="absolute bottom-full right-0 mb-1 px-2 py-1 bg-gray-900 border border-gray-600 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  {{ cc.challenge_type?.name }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()

const gameId = route.params.gameId as string
const fromUsername = route.query.from as string | undefined
const backLink = fromUsername ? `/profile/${fromUsername}` : '/friends'

const { data: gameData, pending: loading, error: gameError } = await useAsyncData(
  `public-game-${gameId}`,
  async () => {
    const { data } = await supabase.from('games').select('*').eq('id', gameId).maybeSingle()
    return data
  },
  { server: false }
)

const { data: gameStats } = await useAsyncData(
  `public-game-stats-${gameId}`,
  async () => {
    const { data } = await supabase.from('game_stats').select('*').eq('game_id', gameId).limit(1).maybeSingle()
    return data
  },
  { server: false }
)

const { data: rawBosses } = await useAsyncData(
  `public-bosses-${gameId}`,
  async () => {
    const { data } = await supabase
      .from('bosses')
      .select(`*, boss_runs(completed, attempts, best_time_seconds,
        challenge_completions(completed, challenge_type:challenge_type_id(name, icon)))`)
      .eq('game_id', gameId)
      .order('is_featured', { ascending: false })
      .order('order_index')
    return data ?? []
  },
  { server: false }
)

// Boss mis en avant d'abord, puis les autres
const bosses = computed(() => {
  if (!rawBosses.value) return []
  return [...rawBosses.value].sort((a: any, b: any) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
})

const colors = ['#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0284c7', '#9333ea']
const gameColor = (name: string) => colors[(name?.charCodeAt(0) ?? 0) % colors.length]
const bossColor = (name: string) => colors[(name?.charCodeAt(0) ?? 0) % colors.length]
const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s > 0 ? `${m}m${s}s` : `${m}m`
}
</script>
