<template>
  <div>
    <div v-if="pending" class="text-gray-400">Chargement...</div>
    <div v-else>

      <!-- Header image de fond -->
      <div class="relative rounded-xl overflow-hidden mb-6 min-h-[320px]">
        <!-- Fond -->
        <div class="absolute inset-0">
          <img v-if="gameData?.cover_url && !imgError" :src="gameData.cover_url"
            class="w-full h-full object-cover" :style="{ objectPosition: imagePosition }" @error="imgError = true" />
          <div v-else class="w-full h-full flex items-center justify-center text-6xl font-black text-white/20"
            :style="{ backgroundColor: avatarColor }">
            {{ initials }}
          </div>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

        <!-- Contenu header -->
        <div class="relative p-6 flex flex-col min-h-[320px]">
          <NuxtLink to="/games" class="text-gray-300 hover:text-white text-sm mb-auto self-start">← Retour</NuxtLink>

          <div class="mt-auto">
            <!-- Nom + rename -->
            <div v-if="!editingName" class="flex items-center gap-2 mb-2">
              <h1 class="text-3xl font-bold text-white drop-shadow">{{ gameInfo?.game_name }}</h1>
              <button @click="startEditName" title="Renommer"
                class="p-1.5 bg-black/40 hover:bg-purple-600 text-gray-300 hover:text-white rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14H8v-2a2 2 0 01.586-1.414z" />
                </svg>
              </button>
            </div>
            <div v-else class="flex items-center gap-2 mb-2">
              <input v-model="newName" @keydown.enter="saveName" @keydown.escape="editingName = false"
                class="bg-black/50 border border-purple-500 rounded-lg px-3 py-1 text-white text-xl font-bold focus:outline-none flex-1 max-w-sm" autofocus />
              <button @click="saveName" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg">OK</button>
              <button @click="editingName = false" class="px-3 py-1 bg-black/40 text-gray-300 text-sm rounded-lg">✕</button>
            </div>

            <!-- Barre de progression -->
            <div v-if="gameInfo" class="mb-3 max-w-sm">
              <div class="flex justify-between text-xs text-gray-300 mb-1">
                <span>{{ gameInfo.completed_bosses }} / {{ gameInfo.total_bosses }} boss</span>
                <span class="text-purple-300 font-medium">{{ gameInfo.completion_percentage }}%</span>
              </div>
              <div class="w-full bg-white/10 rounded-full h-1.5">
                <div class="bg-purple-500 h-1.5 rounded-full transition-all" :style="{ width: `${gameInfo.completion_percentage}%` }" />
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-wrap">

              <button v-if="!editingImage" @click="editingImage = true"
                class="text-xs bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10">
                📷 Changer l'image
              </button>
              <div v-else class="bg-black/60 border border-purple-500/50 rounded-xl p-3 flex flex-col gap-3 w-full max-w-sm">
                <input v-model="newImageUrl" type="url" placeholder="Colle une URL d'image..."
                  class="bg-black/60 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500 w-full" autofocus />
                <div>
                  <p class="text-xs text-gray-400 mb-1.5">Position du cadrage</p>
                  <div class="grid grid-cols-3 gap-1 w-24">
                    <button v-for="pos in positions" :key="pos.value" type="button" @click="imagePosition = pos.value"
                      :class="['w-7 h-7 rounded flex items-center justify-center transition-colors text-xs',
                        imagePosition === pos.value ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-400']"
                      :title="pos.label">●</button>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button type="button" @click="saveImage" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg">OK</button>
                  <button type="button" @click="editingImage = false" class="px-3 py-1.5 bg-black/40 text-gray-300 text-sm rounded-lg">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des boss -->
      <div v-if="!bosses || bosses.length === 0" class="text-center py-12 text-gray-500">
        Aucun boss. Clique sur <span class="text-purple-400">+ Boss</span> pour en ajouter un !
      </div>
      <div>
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs text-gray-500">
            ⭐ <span class="text-yellow-400 font-medium">{{ featuredCount }}/3</span> boss mis en avant sur ton profil
          </p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">

          <!-- Card ajout inline -->
          <div v-if="!showAddBoss"
            @click="showAddBoss = true"
            class="rounded-xl border-2 border-dashed border-gray-600 hover:border-purple-500 min-h-[100px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
            <span class="text-2xl text-gray-600 group-hover:text-purple-400 transition-colors">+</span>
            <span class="text-xs text-gray-500 group-hover:text-purple-400 transition-colors font-medium">Ajouter un boss</span>
          </div>
          <div v-else class="rounded-xl border-2 border-purple-500 min-h-[100px] flex flex-col justify-center gap-3 p-4 bg-gray-800/60">
            <input
              v-model="newBossName"
              @keydown.enter="handleAddBoss"
              @keydown.escape="showAddBoss = false; newBossName = ''"
              autofocus
              placeholder="Nom du boss..."
              class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 w-full"
            />
            <div class="flex gap-2">
              <button @click="handleAddBoss" :disabled="!newBossName.trim() || addingBoss"
                class="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-medium py-1.5 rounded-lg transition-colors">
                {{ addingBoss ? '...' : 'Ajouter' }}
              </button>
              <button @click="showAddBoss = false; newBossName = ''"
                class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs rounded-lg transition-colors">
                ✕
              </button>
            </div>
          </div>

          <BossCard
            v-for="boss in sortedBosses" :key="boss.id"
            :boss="boss"
            :show-pin="true"
            @delete="handleDeleteBoss(boss.id)"
            @toggle-pin="handleTogglePin(boss)"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { getBossesByGame, deleteBoss, updateBoss } = useBosses()
const showAddBoss = ref(false)
const { updateGame } = useGames()
const gameId = route.params.id as string

const { data: gameInfo, refresh: refreshGame } = await useAsyncData(`game-${gameId}`, async () => {
  const { data } = await supabase.from('game_stats').select('*').eq('game_id', gameId).eq('user_id', user.value!.id).single()
  return data
})

const { data: gameData, refresh: refreshGameData } = await useAsyncData(`game-data-${gameId}`, async () => {
  const { data } = await supabase.from('games').select('*').eq('id', gameId).single()
  return data
})

// Avatar fallback
const colors = ['#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0284c7', '#9333ea']
const avatarColor = computed(() => colors[(gameInfo.value?.game_name?.charCodeAt(0) ?? 0) % colors.length])
const initials = computed(() =>
  (gameInfo.value?.game_name ?? '').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
)

// Image + position
const imgError = ref(false)
const editingImage = ref(false)
const newImageUrl = ref(gameData.value?.cover_url ?? '')
const imagePosition = ref(gameData.value?.image_position ?? 'center center')

const positions = [
  { value: 'left top', label: 'Haut gauche' },
  { value: 'center top', label: 'Haut centre' },
  { value: 'right top', label: 'Haut droite' },
  { value: 'left center', label: 'Milieu gauche' },
  { value: 'center center', label: 'Centre' },
  { value: 'right center', label: 'Milieu droite' },
  { value: 'left bottom', label: 'Bas gauche' },
  { value: 'center bottom', label: 'Bas centre' },
  { value: 'right bottom', label: 'Bas droite' },
]

const saveImage = async () => {
  imgError.value = false
  await updateGame(gameId, { cover_url: newImageUrl.value || null, image_position: imagePosition.value })
  await refreshGameData()
  editingImage.value = false
}

// Nom
const editingName = ref(false)
const newName = ref('')
const startEditName = () => { newName.value = gameInfo.value?.game_name ?? ''; editingName.value = true }
const saveName = async () => {
  if (!newName.value.trim()) return
  await updateGame(gameId, { name: newName.value.trim() })
  await refreshGame()
  editingName.value = false
}

const { data: bosses, pending, refresh } = await useAsyncData(`bosses-${gameId}`, () => getBossesByGame(gameId))

const featuredCount = computed(() => bosses.value?.filter((b: any) => b.is_featured).length ?? 0)

const sortedBosses = computed(() => {
  if (!bosses.value) return []
  const rank = (b: any) => {
    if (b.is_featured) return 0
    if (b.boss_runs?.[0]?.completed) return 1
    return 2
  }
  return [...bosses.value].sort((a: any, b: any) => rank(a) - rank(b))
})

const handleTogglePin = async (boss: any) => {
  if (!boss.is_featured && featuredCount.value >= 3) {
    alert('Maximum 3 boss mis en avant par jeu.')
    return
  }
  const newValue = !boss.is_featured
  bosses.value = bosses.value!.map((b: any) =>
    b.id === boss.id ? { ...b, is_featured: newValue } : b
  )
  await updateBoss(boss.id, { is_featured: newValue })
}

const router = useRouter()
const newBossName = ref('')
const addingBoss = ref(false)
const { createBoss } = useBosses()

const handleAddBoss = async () => {
  if (!newBossName.value.trim()) return
  addingBoss.value = true
  try {
    const boss = await createBoss({ game_id: gameId, name: newBossName.value.trim() })
    router.push(`/bosses/${boss.id}`)
  } finally {
    addingBoss.value = false
  }
}

const handleDeleteBoss = async (id: string) => {
  if (!confirm('Supprimer ce boss ?')) return
  await deleteBoss(id)
  if (bosses.value) bosses.value = bosses.value.filter((b: any) => b.id !== id)
  refreshGame()
}
</script>
