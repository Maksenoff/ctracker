<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Amis</h1>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800 border border-gray-600 text-white text-sm px-5 py-3 rounded-2xl shadow-xl">
          {{ toast }}
        </div>
      </Transition>
    </Teleport>

    <!-- Onglets -->
    <div class="flex gap-1 bg-gray-800 rounded-xl p-1 mb-6">
      <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
        :class="['flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
          activeTab === tab.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white']">
        {{ tab.label }}
        <span v-if="tab.id === 'requests' && pendingReceived.length > 0"
          class="bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {{ pendingReceived.length }}
        </span>
      </button>
    </div>

    <!-- Onglet Recherche -->
    <div v-if="activeTab === 'search'">
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="relative mb-4">
          <input v-model="searchQuery" type="text" placeholder="Recherche par pseudo..."
            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 pr-10" autofocus />
          <span class="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
        <div v-if="searchQuery.length >= 2" class="space-y-2">
          <div v-if="searching" class="text-gray-400 text-sm py-2">Recherche...</div>
          <div v-else-if="searchResults.length === 0" class="text-gray-500 text-sm py-2">Aucun joueur trouvé.</div>
          <div v-for="u in searchResults" :key="u.id"
            class="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
                {{ u.username?.[0]?.toUpperCase() ?? '?' }}
              </div>
              <NuxtLink :to="`/profile/${u.username}`" class="font-medium hover:text-purple-400 transition-colors">
                {{ u.username }}
              </NuxtLink>
            </div>
            <div>
              <span v-if="getFriendStatus(u.id) === 'accepted'" class="text-xs bg-green-600/20 text-green-400 px-3 py-1 rounded-full border border-green-600/30">✓ Ami</span>
              <button v-else-if="getFriendStatus(u.id) === 'pending_sent'" @click="cancelRequest(u.id)"
                class="text-xs bg-yellow-600/20 text-yellow-400 hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/30 px-3 py-1 rounded-full border border-yellow-600/30 transition-colors">
                Annuler
              </button>
              <span v-else-if="getFriendStatus(u.id) === 'pending_received'" class="text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-600/30">Demande reçue</span>
              <button v-else @click="addFriend(u.id)"
                class="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full transition-colors">
                + Ajouter
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 text-sm">Tape au moins 2 caractères pour chercher.</p>
      </div>
    </div>

    <!-- Onglet Demandes -->
    <div v-if="activeTab === 'requests'" class="space-y-4">
      <!-- Reçues -->
      <div class="bg-gray-800 rounded-xl p-5">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Reçues
          <span v-if="pendingReceived.length > 0" class="ml-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">{{ pendingReceived.length }}</span>
        </h2>
        <div v-if="pendingReceived.length === 0" class="text-gray-500 text-sm">Aucune demande reçue.</div>
        <div class="space-y-2">
          <div v-for="f in pendingReceived" :key="f.id"
            class="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
                {{ f.requester?.username?.[0]?.toUpperCase() ?? '?' }}
              </div>
              <NuxtLink :to="`/profile/${f.requester?.username}`" class="font-medium hover:text-purple-400 transition-colors">
                {{ f.requester?.username }}
              </NuxtLink>
            </div>
            <div class="flex gap-2">
              <button @click="accept(f.id)" class="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors">Accepter</button>
              <button @click="decline(f.id)" class="text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Refuser</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Envoyées -->
      <div class="bg-gray-800 rounded-xl p-5">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Envoyées</h2>
        <div v-if="pendingSent.length === 0" class="text-gray-500 text-sm">Aucune demande envoyée.</div>
        <div class="space-y-2">
          <div v-for="f in pendingSent" :key="f.id"
            class="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
                {{ f.addressee?.username?.[0]?.toUpperCase() ?? '?' }}
              </div>
              <NuxtLink :to="`/profile/${f.addressee?.username}`" class="font-medium hover:text-purple-400 transition-colors">
                {{ f.addressee?.username }}
              </NuxtLink>
            </div>
            <button @click="decline(f.id)" class="text-xs bg-gray-600 hover:bg-red-600/30 hover:text-red-400 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Onglet Classement -->
    <div v-if="activeTab === 'ranking'" class="bg-gray-800 rounded-xl p-5">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Classement entre amis</h2>
      <div v-if="loadingRanking" class="text-gray-400 text-sm text-center py-6">Chargement...</div>
      <div v-else-if="leaderboard.length <= 1" class="text-gray-500 text-sm text-center py-6">
        Ajoute des amis pour voir le classement !
      </div>
      <div v-else class="space-y-2">
        <div v-for="(entry, i) in leaderboard" :key="entry.id"
          :class="['flex items-center gap-4 rounded-xl px-4 py-3 transition-colors',
            entry.isMe ? 'bg-purple-600/20 border border-purple-500/40' : 'bg-gray-700/50']">
          <span class="text-xl w-8 text-center flex-shrink-0">{{ rankMedal(i) }}</span>
          <div class="w-9 h-9 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-sm font-bold text-white">
            {{ entry.username?.[0]?.toUpperCase() ?? '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-white truncate">
              {{ entry.username }}
              <span v-if="entry.isMe" class="text-xs text-purple-400 font-normal ml-1">(toi)</span>
            </p>
            <p class="text-xs text-gray-400">{{ entry.bossCount }} boss · {{ entry.score }} pts</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-lg font-black" :class="i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-400'">
              {{ entry.score.toLocaleString() }}
            </p>
            <p class="text-xs text-gray-500">pts</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Onglet Amis -->
    <div v-if="activeTab === 'friends'" class="bg-gray-800 rounded-xl p-5">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Mes amis <span class="ml-1 text-gray-500">({{ acceptedFriends.length }})</span>
      </h2>
      <div v-if="acceptedFriends.length === 0" class="text-gray-500 text-sm">
        Aucun ami pour l'instant. Recherche des joueurs par pseudo !
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div v-for="f in acceptedFriends" :key="f.id"
          class="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-3 min-h-[56px]">
          <template v-if="confirmRemoveId === f.id">
            <p class="text-sm text-gray-300">Retirer <span class="text-white font-medium">{{ friendUsername(f) }}</span> ?</p>
            <div class="flex gap-2">
              <button @click="remove(f.id)" class="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">Retirer</button>
              <button @click="confirmRemoveId = null" class="text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Annuler</button>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
                {{ friendUsername(f)?.[0]?.toUpperCase() ?? '?' }}
              </div>
              <NuxtLink :to="`/profile/${friendUsername(f)}`" class="font-medium hover:text-purple-400 transition-colors">
                {{ friendUsername(f) }}
              </NuxtLink>
            </div>
            <button @click="confirmRemoveId = f.id" title="Retirer" class="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const route = useRoute()
const { searchUsers, getFriendships, sendFriendRequest, acceptFriendRequest, removeFriend, getFriendsLeaderboard } = useFriends()

const activeTab = ref<'search' | 'requests' | 'friends' | 'ranking'>(
  (route.query.tab as any) ?? 'search'
)
const tabs = [
  { id: 'search', label: '🔍 Recherche' },
  { id: 'requests', label: '📬 Demandes' },
  { id: 'friends', label: '👥 Amis' },
  { id: 'ranking', label: '🏆 Classement' },
]

const leaderboard = ref<any[]>([])
const loadingRanking = ref(false)

watch(activeTab, async (tab) => {
  if (tab === 'ranking' && leaderboard.value.length === 0) {
    loadingRanking.value = true
    leaderboard.value = await getFriendsLeaderboard()
    loadingRanking.value = false
  }
})

const rankMedal = (i: number) => ['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`

const searchQuery = ref('')
const searching = ref(false)
const searchResults = ref<any[]>([])
const friendships = ref<any[]>([])
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout>

const showToast = (msg: string) => {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3000)
}

const pendingReceived = computed(() => friendships.value.filter(f => f.status === 'pending' && f.addressee_id === user.value!.id))
const pendingSent = computed(() => friendships.value.filter(f => f.status === 'pending' && f.requester_id === user.value!.id))
const acceptedFriends = computed(() => friendships.value.filter(f => f.status === 'accepted'))

const friendUsername = (f: any) => f.requester_id === user.value!.id ? f.addressee?.username : f.requester?.username

const getFriendStatus = (userId: string) => {
  const f = friendships.value.find(f => f.requester_id === userId || f.addressee_id === userId)
  if (!f) return null
  if (f.status === 'accepted') return 'accepted'
  if (f.requester_id === user.value!.id) return 'pending_sent'
  return 'pending_received'
}

const addFriend = async (userId: string) => {
  try {
    await sendFriendRequest(userId)
    await loadFriendships()
    showToast('Demande d\'ami envoyée !')
  } catch (e: any) {
    showToast('Erreur : ' + (e.message ?? 'impossible d\'envoyer la demande'))
  }
}

const cancelRequest = async (userId: string) => {
  const f = friendships.value.find(f => f.requester_id === user.value!.id && f.addressee_id === userId)
  if (f) { await removeFriend(f.id); await loadFriendships() }
  showToast('Demande annulée.')
}

const accept = async (id: string) => {
  await acceptFriendRequest(id)
  await loadFriendships()
  showToast('Ami ajouté !')
}

const decline = async (id: string) => {
  await removeFriend(id)
  await loadFriendships()
}

const confirmRemoveId = ref<string | null>(null)

const remove = async (id: string) => {
  await removeFriend(id)
  confirmRemoveId.value = null
  await loadFriendships()
}

const loadFriendships = async () => {
  friendships.value = await getFriendships()
}

let debounceTimer: ReturnType<typeof setTimeout>
watch(searchQuery, (q) => {
  clearTimeout(debounceTimer)
  if (q.length < 2) { searchResults.value = []; return }
  searching.value = true
  debounceTimer = setTimeout(async () => {
    searchResults.value = await searchUsers(q)
    searching.value = false
  }, 300)
})

await loadFriendships()

// Realtime : mise à jour auto quand une friendship change
let channel: ReturnType<typeof supabase.channel> | null = null
onMounted(() => {
  if (!user.value) return
  channel = supabase
    .channel(`friends-page-${user.value.id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => loadFriendships())
    .subscribe()
})
onUnmounted(() => { if (channel) supabase.removeChannel(channel) })
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(16px); }
</style>
