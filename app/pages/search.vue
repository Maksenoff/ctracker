<template>
  <div>
    <h1 class="text-2xl font-bold mb-2">Rechercher un jeu</h1>
    <p class="text-gray-400 text-sm mb-6">Trouve un jeu et ajoute-le directement à ta bibliothèque.</p>

    <!-- Barre de recherche -->
    <div class="relative mb-8">
      <input
        v-model="query"
        type="text"
        placeholder="Ex: Elden Ring, Dark Souls, Hollow Knight..."
        class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-lg"
      />
      <svg class="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <button v-if="query" @click="query = ''" class="absolute right-3.5 top-3.5 text-gray-500 hover:text-white transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Erreur clé API -->
    <div v-if="apiKeyMissing" class="bg-yellow-900/30 border border-yellow-700 rounded-xl p-5 text-yellow-300">
      <p class="font-semibold mb-1">⚠️ Clé API RAWG manquante</p>
      <p class="text-sm">Inscris-toi sur <strong>rawg.io/apidocs</strong>, copie ta clé et colle-la dans <code>.env</code> → <code>RAWG_API_KEY=ta_clé</code>, puis redémarre le serveur.</p>
    </div>

    <template v-else>
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <template v-else>
        <!-- Titre section -->
        <p class="text-sm text-gray-400 mb-4">
          <template v-if="isSearching">{{ totalCount.toLocaleString() }} résultats pour "{{ displayedQuery }}"</template>
          <template v-else>🔥 Jeux populaires</template>
        </p>

        <!-- Grille -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          <GameSearchCard
            v-for="game in displayedResults"
            :key="game.id"
            :game="game"
            :added="addedIds.has(game.id)"
            @add="addGame(game)"
          />
        </div>

        <!-- Aucun résultat -->
        <div v-if="isSearching && displayedResults.length === 0" class="text-center py-12 text-gray-500">
          Aucun jeu trouvé pour "{{ displayedQuery }}".
        </div>

        <!-- Pagination (seulement en mode recherche) -->
        <div v-if="isSearching && totalCount > 12" class="flex justify-center gap-3">
          <button @click="loadPage(page - 1)" :disabled="page <= 1"
            class="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white rounded-lg text-sm transition-colors">
            ← Précédent
          </button>
          <span class="px-4 py-2 text-gray-400 text-sm">Page {{ page }}</span>
          <button @click="loadPage(page + 1)" :disabled="page * 12 >= totalCount"
            class="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white rounded-lg text-sm transition-colors">
            Suivant →
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
if (!user.value) await navigateTo('/login')

const config = useRuntimeConfig()
const { searchGames, getPopularGames } = useRawg()
const { createGame } = useGames()

const query = ref('')
const searchResults = ref<any[]>([])
const popularGames = ref<any[]>([])
const totalCount = ref(0)
const loading = ref(false)
const displayedQuery = ref('')
const page = ref(1)
const addedIds = ref<Set<number>>(new Set())

const apiKeyMissing = computed(() => !config.public.rawgApiKey || config.public.rawgApiKey === 'your-rawg-api-key')
const isSearching = computed(() => displayedQuery.value.length > 0)
const displayedResults = computed(() => isSearching.value ? searchResults.value : popularGames.value)

// Chargement des jeux populaires au démarrage
if (!apiKeyMissing.value) {
  loading.value = true
  popularGames.value = await getPopularGames().catch(() => [])
  loading.value = false
}

// Recherche dynamique avec debounce via watch
let debounceTimer: ReturnType<typeof setTimeout>
watch(query, (val) => {
  clearTimeout(debounceTimer)
  if (!val.trim()) {
    searchResults.value = []
    displayedQuery.value = ''
    return
  }
  debounceTimer = setTimeout(() => loadPage(1), 300)
})

const loadPage = async (p: number) => {
  loading.value = true
  page.value = p
  displayedQuery.value = query.value
  try {
    const { results, count } = await searchGames(query.value, p)
    searchResults.value = results
    totalCount.value = count
  } catch {
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const addGame = async (game: any) => {
  await createGame(game.name, game.background_image ?? undefined)
  addedIds.value = new Set([...addedIds.value, game.id])
}
</script>
