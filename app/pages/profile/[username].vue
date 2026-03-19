<template>
  <div>
    <div v-if="loading" class="text-gray-400">Chargement...</div>
    <div v-else-if="profileError" class="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-400 text-sm">
      Erreur : {{ profileError.message }}
    </div>
    <div v-else-if="!profileData" class="text-center py-16 text-gray-500">
      Profil introuvable.
    </div>
    <div v-else>

      <!-- Header profil -->
      <div class="bg-gray-800 rounded-xl p-6 mb-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
              {{ profileData.profile.username?.[0]?.toUpperCase() ?? '?' }}
            </div>
            <div>
              <div v-if="!editingUsername" class="flex items-center gap-2">
                <h1 class="text-2xl font-bold">{{ profileData.profile.username }}</h1>
                <button v-if="isOwnProfile" @click="startEditUsername"
                  class="p-1.5 bg-gray-700 hover:bg-purple-600 text-gray-400 hover:text-white rounded-lg transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14H8v-2a2 2 0 01.586-1.414z" />
                  </svg>
                </button>
              </div>
              <div v-else class="flex items-center gap-2">
                <input v-model="newUsername" @keydown.enter="saveUsername" @keydown.escape="editingUsername = false"
                  class="bg-gray-700 border border-purple-500 rounded-lg px-3 py-1 text-white text-xl font-bold focus:outline-none w-44" autofocus />
                <button @click="saveUsername" :disabled="savingUsername"
                  class="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg">
                  {{ savingUsername ? '...' : 'OK' }}
                </button>
                <button @click="editingUsername = false" class="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-lg">✕</button>
              </div>
              <p v-if="usernameError" class="text-red-400 text-xs mt-1">{{ usernameError }}</p>
            </div>
          </div>

          <!-- Bouton ami (si ce n'est pas son propre profil) -->
          <div v-if="!isOwnProfile" class="flex-shrink-0">
            <span v-if="friendStatus === 'accepted'"
              class="text-sm bg-green-600/20 text-green-400 px-4 py-2 rounded-lg border border-green-600/30 flex items-center gap-2">
              ✓ Ami
              <button @click="removeFriendHandler" class="text-green-600 hover:text-red-400 transition-colors ml-1 text-xs">✕</button>
            </span>
            <span v-else-if="friendStatus === 'pending_sent'"
              class="text-sm bg-yellow-600/20 text-yellow-400 px-4 py-2 rounded-lg border border-yellow-600/30">
              Demande envoyée
            </span>
            <div v-else-if="friendStatus === 'pending_received'" class="flex gap-2">
              <button @click="acceptHandler" class="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                Accepter
              </button>
              <button @click="declineHandler" class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-colors">
                Refuser
              </button>
            </div>
            <button v-else @click="addFriendHandler"
              class="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
              + Ajouter
            </button>
          </div>
          <NuxtLink v-else to="/games"
            class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-colors flex-shrink-0">
            Mes jeux →
          </NuxtLink>
        </div>

        <!-- Stats globales -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div class="bg-gray-700/50 rounded-lg p-3 text-center">
            <p class="text-2xl font-black text-purple-400">{{ profileData.totalBosses }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Boss complétés</p>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3 text-center">
            <p class="text-2xl font-black text-yellow-400">{{ profileData.totalChallenges }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Défis validés</p>
          </div>
          <div class="bg-gradient-to-br from-purple-600/30 to-purple-800/20 border border-purple-500/30 rounded-lg p-3 text-center col-span-2 sm:col-span-2">
            <p class="text-3xl font-black text-white">{{ profileData.score.toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Score total</p>
            <div class="flex justify-center gap-3 mt-2 text-xs text-gray-500">
              <span>⚔️ {{ profileData.bossPoints ?? profileData.totalBosses * 100 }} pts boss</span>
              <span>🏆 {{ profileData.challengePoints ?? 0 }} pts défis</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Jeux -->
      <div v-if="profileData.gameStats.length > 0" class="mb-6">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Jeux</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NuxtLink v-for="game in sortedGameStats" :key="game.game_id"
            :to="`/public-game/${game.game_id}?from=${username}`"
            class="bg-gray-800 rounded-xl overflow-hidden relative min-h-[110px] hover:border-purple-500 border border-transparent transition-all">
            <!-- Image fond -->
            <div class="absolute inset-0">
              <img v-if="game.cover_url" :src="game.cover_url" class="w-full h-full object-cover opacity-40" />
              <div v-else class="w-full h-full" :style="{ backgroundColor: gameColor(game.game_name) }" />
            </div>
            <div class="absolute inset-0 bg-gradient-to-r from-black/85 to-black/40" />
            <div class="relative p-4 flex flex-col justify-between min-h-[110px]">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <p class="font-bold text-white">{{ game.game_name }}</p>
                    <span v-if="game.is_favorite" class="text-pink-400 text-2xl leading-none drop-shadow-lg">♥</span>
                  </div>
                  <p class="text-xs text-gray-300 mt-0.5">{{ game.completed_bosses }}/{{ game.total_bosses }} boss · <span class="text-purple-400 font-medium">{{ game.completion_percentage }}%</span></p>
                  <div class="w-32 bg-white/10 rounded-full h-1 mt-1.5">
                    <div class="bg-purple-500 h-1 rounded-full" :style="{ width: `${game.completion_percentage}%` }" />
                  </div>
                </div>
              </div>
              <!-- Boss mis en avant -->
              <div v-if="getFeaturedBosses(game.game_id).length > 0" class="flex items-center gap-2 mt-3">
                <div v-for="boss in getFeaturedBosses(game.game_id)" :key="boss.id" class="flex flex-col items-center gap-0.5">
                  <div class="w-9 h-9 rounded-full overflow-hidden border-2 border-yellow-500/60 flex-shrink-0">
                    <img v-if="boss.image_url" :src="boss.image_url" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-xs font-black text-white"
                      :style="{ backgroundColor: bossColor(boss.name) }">
                      {{ boss.name?.[0]?.toUpperCase() }}
                    </div>
                  </div>
                  <span class="text-white/70 text-[10px] leading-tight max-w-[36px] text-center truncate">{{ boss.name }}</span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Boss complétés avec défis -->
      <div v-if="profileData.bossRuns.length > 0">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Boss complétés</h2>
        <div class="space-y-2">
          <div v-for="run in profileData.bossRuns" :key="run.id"
            class="bg-gray-800 rounded-xl overflow-hidden flex items-center gap-4 p-3 relative">
            <!-- Mini image boss -->
            <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
              <img v-if="run.boss?.image_url" :src="run.boss.image_url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-lg font-black text-white/30"
                :style="{ backgroundColor: bossColor(run.boss?.name) }">
                {{ run.boss?.name?.[0]?.toUpperCase() }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-white truncate">{{ run.boss?.name }}</p>
              <p class="text-xs text-gray-500">{{ run.attempts }} essais<span v-if="run.best_time_seconds"> · {{ formatTime(run.best_time_seconds) }}</span></p>
            </div>
            <!-- Badges défis -->
            <div class="flex flex-wrap gap-1 justify-end max-w-[120px]">
              <template v-for="cc in run.challenge_completions" :key="cc.challenge_type?.name">
                <div v-if="cc.completed" class="relative group">
                  <span class="text-base leading-none cursor-default">{{ cc.challenge_type?.icon }}</span>
                  <div class="absolute bottom-full right-0 mb-1 px-2 py-1 bg-gray-900 border border-gray-600 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                    {{ cc.challenge_type?.name }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="profileData.totalBosses === 0" class="text-center py-12 text-gray-500">
        Aucun boss complété pour l'instant.
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const user = useSupabaseUser()
const { getPublicProfile, getFriendshipWith, sendFriendRequest, acceptFriendRequest, removeFriend } = useFriends()

const username = route.params.username as string

const { data: profileData, pending: loading, error: profileError } = await useAsyncData(
  `profile-${username}`,
  () => getPublicProfile(username),
  { server: false }
)

const friendship = ref<any>(null)
const { updateUsername } = useProfile()
const editingUsername = ref(false)
const newUsername = ref('')
const savingUsername = ref(false)
const usernameError = ref('')

const startEditUsername = () => {
  newUsername.value = profileData.value?.profile.username ?? ''
  editingUsername.value = true
  usernameError.value = ''
}

const saveUsername = async () => {
  if (!newUsername.value.trim()) return
  savingUsername.value = true
  usernameError.value = ''
  try {
    await updateUsername(newUsername.value.trim())
    profileData.value!.profile.username = newUsername.value.trim()
    editingUsername.value = false
    await navigateTo(`/profile/${newUsername.value.trim()}`, { replace: true })
  } catch (e: any) {
    usernameError.value = e.message
  } finally {
    savingUsername.value = false
  }
}

const isOwnProfile = computed(() => {
  if (!user.value || !profileData.value) return false
  return profileData.value.profile.id === user.value.id
})

const friendStatus = computed(() => {
  if (!friendship.value) return null
  if (friendship.value.status === 'accepted') return 'accepted'
  if (friendship.value.requester_id === user.value!.id) return 'pending_sent'
  return 'pending_received'
})

// Charge la relation d'amitié côté client seulement
if (process.client) {
  watch([profileData, user], async ([pd, u]) => {
    if (pd && u && !isOwnProfile.value) {
      friendship.value = await getFriendshipWith(pd.profile.id)
    }
  }, { immediate: true })
}

const addFriendHandler = async () => {
  await sendFriendRequest(profileData.value!.profile.id)
  friendship.value = await getFriendshipWith(profileData.value!.profile.id)
}
const acceptHandler = async () => {
  await acceptFriendRequest(friendship.value.id)
  friendship.value = await getFriendshipWith(profileData.value!.profile.id)
}
const declineHandler = async () => {
  await removeFriend(friendship.value.id)
  friendship.value = null
}
const removeFriendHandler = async () => {
  if (!confirm('Retirer cet ami ?')) return
  await removeFriend(friendship.value.id)
  friendship.value = null
}

const colors = ['#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0284c7', '#9333ea']
const gameColor = (name: string) => colors[(name?.charCodeAt(0) ?? 0) % colors.length]
const bossColor = (name: string) => colors[(name?.charCodeAt(0) ?? 0) % colors.length]
const sortedGameStats = computed(() => {
  if (!profileData.value?.gameStats) return []
  return [...profileData.value.gameStats].sort((a: any, b: any) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0))
})

const getFeaturedBosses = (gameId: string) =>
  profileData.value?.featuredBosses?.filter((b: any) => b.game_id === gameId) ?? []
const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s > 0 ? `${m}m${s}s` : `${m}m`
}
</script>
