<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Mes Jeux</h1>
      <button @click="showModal = true" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        + Ajouter un jeu
      </button>
    </div>

    <div v-if="pending" class="text-gray-400">Chargement...</div>
    <div v-else-if="!games || games.length === 0" class="text-center py-16 text-gray-500">
      Aucun jeu pour l'instant. Commence par en ajouter un !
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <GameCard
        v-for="game in sortedGames"
        :key="game.game_id"
        :game="game"
        :show-favorite="true"
        @delete="handleDelete(game.game_id)"
        @set-favorite="handleSetFavorite(game.game_id, game.is_favorite)"
      />
    </div>

    <Modal v-if="showModal" @close="showModal = false">
      <template #title>Nouveau jeu</template>
      <GameForm @saved="handleGameSaved" @cancel="showModal = false" />
    </Modal>
  </div>
</template>

<script setup lang="ts">
const { getGames, deleteGame, setFavoriteGame } = useGames()
const showModal = ref(false)

const { data: games, pending, refresh } = await useAsyncData('games', getGames)

const sortedGames = computed(() => {
  if (!games.value) return []
  return [...games.value].sort((a: any, b: any) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0))
})

const handleGameSaved = (gameId: string) => {
  navigateTo(`/games/${gameId}`)
}

const handleSetFavorite = async (id: string, current: boolean) => {
  await setFavoriteGame(id, current)
  refresh()
}

const handleDelete = async (id: string) => {
  if (!confirm('Supprimer ce jeu et tous ses boss ?')) return
  await deleteGame(id)
  refresh()
}
</script>
