<template>
  <div class="relative" ref="container">
    <template v-if="user">
      <button @click="open = !open" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
          {{ initial }}
        </div>
        <span class="text-sm text-gray-300 hidden sm:block max-w-[120px] truncate">{{ displayName }}</span>
      </button>

      <div v-if="open" @click.stop class="absolute right-0 top-11 bg-gray-800 border border-gray-700 rounded-xl shadow-xl w-64 z-50">
        <!-- Infos utilisateur -->
        <div class="px-4 py-3 border-b border-gray-700">
          <p class="text-xs text-gray-400 mb-1">Email</p>
          <p class="text-sm text-white break-all">{{ userEmail }}</p>
        </div>

        <!-- Pseudo -->
        <div class="px-4 py-3 border-b border-gray-700">
          <p class="text-xs text-gray-400 mb-1">Pseudo</p>
          <p class="text-sm text-white">{{ profile?.username || 'Non défini' }}</p>
        </div>

        <!-- Lien profil public -->
        <NuxtLink v-if="profile?.username" :to="`/profile/${profile.username}`" @click="open = false"
          class="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors border-t border-gray-700">
          👤 Mon Profil
        </NuxtLink>
        <NuxtLink v-else-if="profileLoaded && !profile?.username" to="/dashboard" @click="open = false"
          class="block px-4 py-3 text-sm text-yellow-400 hover:bg-gray-700 transition-colors border-t border-gray-700">
          ⚠️ Définir un pseudo →
        </NuxtLink>

        <button @click="logout" class="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 rounded-b-xl transition-colors">
          Se déconnecter
        </button>
      </div>
    </template>
    <template v-else>
      <NuxtLink to="/login" class="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg transition-colors font-medium">
        Se connecter
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { getProfile } = useProfile()

const open = ref(false)
const container = ref<HTMLElement>()

const profile = ref<{ username?: string } | null>(null)
const profileLoaded = ref(false)

const userEmail = computed(() =>
  user.value?.email || user.value?.user_metadata?.email || ''
)

const displayName = computed(() =>
  profile.value?.username || userEmail.value.split('@')[0] || 'Utilisateur'
)

const initial = computed(() => displayName.value[0]?.toUpperCase() ?? '?')

// Charge/reset le profil selon l'utilisateur connecté
watch(user, async (u) => {
  profileLoaded.value = false
  profile.value = u ? await getProfile() : null
  profileLoaded.value = true
}, { immediate: true })

// Recharge à l'ouverture pour avoir les données fraîches
watch(open, async (val) => {
  if (val && user.value) profile.value = await getProfile()
})


onMounted(() => {
  document.addEventListener('click', (e) => {
    if (container.value && !container.value.contains(e.target as Node)) {
      open.value = false
    }
  })
})

const logout = async () => {
  open.value = false
  await supabase.auth.signOut()
  navigateTo('/')
}
</script>
