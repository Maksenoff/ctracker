<template>
  <div>
    <div v-if="pending" class="text-center py-20 text-gray-400">Chargement...</div>
    <div v-else-if="stats">
      <!-- Bannière setup pseudo -->
      <div v-if="profileLoaded && !hasUsername" class="mb-6 bg-yellow-900/30 border border-yellow-600/40 rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-yellow-400 font-semibold text-sm">⚠️ Tu n'as pas encore de pseudo</p>
          <p class="text-yellow-300/70 text-xs mt-0.5">Définis un pseudo pour accéder à ton profil et être trouvable par tes amis.</p>
        </div>
        <div v-if="!settingUsername" class="flex gap-2 flex-shrink-0">
          <button @click="settingUsername = true" class="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-lg transition-colors">
            Définir mon pseudo
          </button>
        </div>
        <div v-else class="flex gap-2 flex-shrink-0">
          <input v-model="newUsername" @keydown.enter="saveUsername" @keydown.escape="settingUsername = false"
            placeholder="ton_pseudo" autofocus
            class="bg-gray-800 border border-yellow-500 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none w-36" />
          <button @click="saveUsername" :disabled="savingUsername"
            class="text-sm bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors">
            {{ savingUsername ? '...' : 'OK' }}
          </button>
        </div>
      </div>

      <h1 class="text-2xl font-bold mb-6">Mon Dashboard</h1>

      <!-- Score global -->
      <div class="mb-8 bg-gray-800 rounded-2xl p-6 border border-gray-700 flex items-center gap-6">
        <div class="text-center">
          <p class="text-gray-400 text-xs uppercase tracking-widest mb-1">Score Global</p>
          <p class="text-5xl font-black text-purple-400">{{ stats.globalScore }}</p>
        </div> 
        <div class="w-px h-16 bg-gray-700" />
        <div class="grid grid-cols-3 gap-6 flex-1">
          <StatCard label="Boss complétés" :value="`${stats.completedBosses} / ${stats.totalBosses}`" icon="🏴" />
          <StatCard label="Défis validés" :value="String(stats.totalChallenges)" icon="🏆" />
          <StatCard
            label="Progression"
            :value="stats.totalBosses > 0 ? `${Math.round((stats.completedBosses / stats.totalBosses) * 100)}%` : '0%'"
            icon="📈"
          />
        </div>
      </div>

      <!-- Liste jeux -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">Progression par jeu</h2>
        <NuxtLink to="/games" class="text-sm text-purple-400 hover:text-purple-300 transition-colors">Gérer mes jeux →</NuxtLink>
      </div>
      <div v-if="stats.games.length === 0" class="text-gray-500 text-center py-10">
        Aucun jeu. <NuxtLink to="/games" class="text-purple-400 underline">Ajouter un jeu →</NuxtLink>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <GameProgressRow
          v-for="game in stats.games"
          :key="game.game_id"
          :game="game"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
if (!user.value) await navigateTo('/login')

const { getGlobalStats } = useChallenges()
const { getProfile, updateUsername } = useProfile()
const { data: stats, pending } = await useAsyncData('global-stats', getGlobalStats)

const profile = ref<any>(null)
const profileLoaded = ref(false)
const hasUsername = computed(() => !!profile.value?.username)
const settingUsername = ref(false)
const newUsername = ref('')
const savingUsername = ref(false)

onMounted(async () => {
  profile.value = await getProfile()
  profileLoaded.value = true
})

const saveUsername = async () => {
  if (!newUsername.value.trim()) return
  savingUsername.value = true
  try {
    await updateUsername(newUsername.value.trim())
    profile.value = { ...profile.value, username: newUsername.value.trim() }
    settingUsername.value = false
    await navigateTo(`/profile/${newUsername.value.trim()}`)
  } finally {
    savingUsername.value = false
  }
}
</script>
