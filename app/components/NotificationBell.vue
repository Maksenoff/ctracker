<template>
  <div class="relative" ref="container">
    <button @click="open = !open"
      :class="['relative p-2 transition-colors rounded-lg', visible.length > 0 ? 'text-white' : 'text-gray-600 hover:text-gray-400']">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span v-if="visible.length > 0"
        class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
        {{ visible.length }}
      </span>
    </button>

    <Transition name="dropdown">
      <div v-if="open" @click.stop
        class="absolute right-0 top-11 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-80 z-50 overflow-hidden">

        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <p class="text-sm font-semibold text-white">Notifications</p>
          <button v-if="visible.length > 0" @click="clearAll"
            class="text-xs text-gray-400 hover:text-red-400 transition-colors">
            Tout effacer
          </button>
        </div>

        <!-- Liste scrollable -->
        <div class="max-h-80 overflow-y-auto">
          <div v-if="visible.length === 0" class="px-4 py-8 text-center text-gray-500 text-sm">
            Aucune notification
          </div>
          <div v-for="f in visible" :key="f.id"
            class="flex flex-col gap-2 px-4 py-3 border-b border-gray-700/50 last:border-0">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-sm font-bold text-white">
                {{ f.requester?.username?.[0]?.toUpperCase() ?? '?' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-white font-medium">Demande de <span class="text-purple-400">{{ f.requester?.username }}</span></p>
              </div>
              <button @click="dismiss(f.id)"
                class="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex gap-2 pl-12">
              <button @click="accept(f.id)"
                class="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg transition-colors font-medium">
                Accepter
              </button>
              <button @click="decline(f.id)"
                class="flex-1 text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 py-1.5 rounded-lg transition-colors">
                Refuser
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <NuxtLink to="/friends" @click="open = false"
          class="block px-4 py-2.5 text-xs text-purple-400 hover:text-purple-300 text-center border-t border-gray-700 transition-colors">
          Gérer les amis →
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { acceptFriendRequest, removeFriend } = useFriends()

const open = ref(false)
const container = ref<HTMLElement>()
const pending = ref<any[]>([])
const dismissed = useState<string[]>('dismissed-notifs', () => [])

const visible = computed(() => pending.value.filter(f => !dismissed.value.includes(f.id)))

const load = async () => {
  if (!user.value) return
  const { data } = await supabase
    .from('friendships')
    .select('*, requester:profiles!friendships_requester_id_fkey(username)')
    .eq('addressee_id', user.value.id)
    .eq('status', 'pending')
  pending.value = data ?? []
}

const dismiss = (id: string) => {
  dismissed.value = [...dismissed.value, id]
}

const clearAll = () => {
  dismissed.value = [...dismissed.value, ...visible.value.map((f: any) => f.id)]
}

const accept = async (id: string) => {
  await acceptFriendRequest(id)
  dismiss(id)
  await load()
}

const decline = async (id: string) => {
  await removeFriend(id)
  dismiss(id)
  await load()
}

let channel: ReturnType<typeof supabase.channel> | null = null

const setupRealtime = () => {
  if (channel) supabase.removeChannel(channel)
  if (!user.value) return
  // Pas de filtre pour éviter les problèmes de REPLICA IDENTITY
  channel = supabase
    .channel(`friend-requests-${user.value.id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => load())
    .subscribe()
}

watch(user, (u) => {
  if (u) { load(); setupRealtime() }
  else { pending.value = []; dismissed.value = []; if (channel) supabase.removeChannel(channel) }
}, { immediate: true })

onUnmounted(() => { if (channel) supabase.removeChannel(channel) })

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (container.value && !container.value.contains(e.target as Node)) open.value = false
  })
})
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
