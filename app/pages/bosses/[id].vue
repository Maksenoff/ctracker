<template>
  <div>
    <div v-if="pending" class="text-gray-400">Chargement...</div>
    <div v-else-if="boss">

      <!-- Header image de fond -->
      <div class="relative rounded-xl overflow-hidden mb-6 min-h-[320px]">
        <!-- Fond -->
        <div class="absolute inset-0">
          <img v-if="boss.image_url && !imgError" :src="boss.image_url"
            class="w-full h-full object-cover" :style="{ objectPosition: imagePosition }" @error="imgError = true" />
          <div v-else class="w-full h-full flex items-center justify-center text-6xl font-black text-white/20"
            :style="{ backgroundColor: avatarColor }">
            {{ initials }}
          </div>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

        <!-- Contenu header -->
        <div class="relative p-6 flex flex-col min-h-[320px]">
          <NuxtLink :to="`/games/${boss.game_id}`" class="text-gray-300 hover:text-white text-sm mb-auto self-start">
            ← Retour
          </NuxtLink>

          <div class="mt-auto">
            <!-- Nom + rename -->
            <div v-if="!editingName" class="flex items-center gap-2 mb-2">
              <h1 class="text-3xl font-bold text-white drop-shadow">{{ boss.name }}</h1>
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

            <!-- Bouton changer image -->
            <div class="flex items-center gap-2 flex-wrap">
              <button v-if="!editingImage" @click="editingImage = true"
                class="text-xs bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10">
                📷 Changer l'image
              </button>
              <div v-else class="bg-black/70 border border-purple-500/50 rounded-xl p-4 w-full max-w-2xl flex gap-4">

                <!-- Gauche : onglets + contenu -->
                <div class="flex-1 flex flex-col gap-3 min-w-0">
                  <!-- Onglets -->
                  <div class="flex gap-1 bg-black/40 rounded-lg p-1">
                    <button v-for="tab in imageTabs" :key="tab.id" type="button" @click="imageTab = tab.id"
                      :class="['flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
                        imageTab === tab.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white']">
                      {{ tab.label }}
                    </button>
                  </div>

                  <!-- Recherche -->
                  <div v-if="imageTab === 'search'" class="flex flex-col gap-2">
                    <div class="flex gap-2">
                      <input v-model="imageSearchQuery" type="text" :placeholder="`ex: ${boss?.name}`"
                        @keydown.enter="searchImages"
                        class="flex-1 bg-black/60 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500" autofocus />
                      <button type="button" @click="searchImages"
                        class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg flex-shrink-0 transition-colors">
                        🔍
                      </button>
                    </div>
                    <div v-if="imageSearchLoading" class="text-gray-400 text-xs text-center py-4">Recherche en cours...</div>
                    <div v-else-if="imageResults.length > 0" class="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto pr-1">
                      <button v-for="url in imageResults" :key="url" type="button" @click="selectImage(url)"
                        :class="['rounded-lg overflow-hidden border-2 transition-all block h-16',
                          newImageUrl === url ? 'border-purple-500 ring-1 ring-purple-400' : 'border-transparent hover:border-purple-400']">
                        <img :src="url" class="w-full h-full object-cover" @error="($event.target as HTMLElement).parentElement!.style.display='none'" />
                      </button>
                    </div>
                    <p v-if="imageSearchError" class="text-red-400 text-xs">{{ imageSearchError }}</p>
                  </div>

                  <!-- Upload -->
                  <div v-if="imageTab === 'upload'" class="flex flex-col gap-2">
                    <label class="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg p-8 cursor-pointer transition-colors">
                      <span class="text-3xl">📁</span>
                      <span class="text-sm text-gray-300">Clique pour choisir une image</span>
                      <span class="text-xs text-gray-500">JPG, PNG, WEBP</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" @change="handleUpload" />
                    </label>
                    <div v-if="uploadLoading" class="text-gray-400 text-xs text-center">Upload en cours...</div>
                    <p v-if="uploadError" class="text-red-400 text-xs">{{ uploadError }}</p>
                  </div>

                  <!-- URL -->
                  <div v-if="imageTab === 'url'">
                    <input v-model="newImageUrl" type="url" placeholder="https://..."
                      class="w-full bg-black/60 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500" autofocus />
                  </div>
                </div>

                <!-- Droite : aperçu + cadrage + boutons -->
                <div class="flex flex-col gap-3 w-40 flex-shrink-0">
                  <!-- Aperçu -->
                  <div class="rounded-lg overflow-hidden aspect-video bg-gray-800 border border-gray-700">
                    <img v-if="newImageUrl" :src="newImageUrl" class="w-full h-full object-cover"
                      :style="{ objectPosition: imagePosition }" @error="($event.target as HTMLElement).style.display='none'" />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-600 text-xs">Aperçu</div>
                  </div>

                  <!-- Position -->
                  <div>
                    <p class="text-xs text-gray-400 mb-1.5">Cadrage</p>
                    <div class="grid grid-cols-3 gap-1">
                      <button v-for="pos in positions" :key="pos.value" type="button" @click="imagePosition = pos.value"
                        :class="['w-full aspect-square rounded flex items-center justify-center transition-colors text-xs',
                          imagePosition === pos.value ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-400']"
                        :title="pos.label">●</button>
                    </div>
                  </div>

                  <!-- Boutons -->
                  <div class="flex flex-col gap-1.5 mt-auto">
                    <button type="button" @click="saveImage"
                      class="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Appliquer
                    </button>
                    <button type="button" @click="editingImage = false; imageResults = []"
                      class="w-full py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Run info -->
      <div class="bg-gray-800 rounded-xl p-5 mb-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-200">Suivi de performance</h2>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wide">Tentatives</label>
            <input v-model.number="form.attempts" type="number" min="0"
              class="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="0" />
          </div>
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wide">Meilleur temps (min)</label>
            <input v-model.number="form.best_time_minutes" type="number" min="0" step="0.5"
              class="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="0" />
          </div>
        </div>
        <div class="mb-4">
          <label class="text-xs text-gray-400 uppercase tracking-wide">Notes personnelles</label>
          <textarea v-model="form.notes" rows="3"
            class="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
            placeholder="Stratégie, observations..." />
        </div>
        <label class="flex items-center gap-3 cursor-pointer mb-4">
          <input v-model="form.completed" type="checkbox" class="w-5 h-5 accent-purple-500" />
          <span class="font-medium">Boss complété ✅</span>
        </label>
        <div class="flex items-center gap-3">
          <button @click="saveRun" :disabled="saving"
            class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
          <span v-if="saveSuccess" class="text-green-400 text-sm">✓ Sauvegardé</span>
          <span v-if="saveError" class="text-red-400 text-sm">{{ saveError }}</span>
        </div>
      </div>

      <!-- Défis -->
      <div class="bg-gray-800 rounded-xl p-5 mb-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-200">Défis</h2>
        <div v-if="!bossRun" class="text-gray-500 text-sm">
          Sauvegarde d'abord les infos de run pour activer les défis.
        </div>
        <div v-else class="space-y-2">
          <ChallengeRow v-for="ct in challengeTypes" :key="ct.id" :challenge-type="ct"
            :completed="isChallengeCompleted(ct.id)" @toggle="toggleChallengeHandler(ct.id, $event)" />
        </div>
      </div>

      <!-- Vidéos YouTube -->
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-200">Vidéos</h2>
          <button @click="showAddVideo = !showAddVideo"
            class="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une vidéo
          </button>
        </div>

        <!-- Formulaire ajout -->
        <div v-if="showAddVideo" class="bg-gray-700 rounded-lg p-4 mb-4 space-y-3">
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wide">URL YouTube</label>
            <input v-model="newVideoUrl" type="url" placeholder="https://www.youtube.com/watch?v=..."
              class="mt-1 w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wide">Titre (optionnel)</label>
            <input v-model="newVideoLabel" type="text" placeholder="ex: Run No Hit, Premier kill..."
              class="mt-1 w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div class="flex gap-2">
            <button @click="addVideo" :disabled="!newVideoUrl.trim()"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
              Ajouter
            </button>
            <button @click="showAddVideo = false; newVideoUrl = ''; newVideoLabel = ''"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 text-sm rounded-lg transition-colors">
              Annuler
            </button>
            <span v-if="videoError" class="text-red-400 text-sm self-center">{{ videoError }}</span>
          </div>
        </div>

        <!-- Liste des vidéos -->
        <div v-if="videos.length === 0 && !showAddVideo" class="text-gray-500 text-sm">
          Aucune vidéo ajoutée. Ajoute une URL YouTube pour intégrer ton run.
        </div>
        <div class="space-y-4">
          <div v-for="video in videos" :key="video.id" class="bg-gray-700 rounded-lg overflow-hidden">
            <div class="flex items-center justify-between px-4 py-2 border-b border-gray-600">
              <!-- Titre éditable -->
              <div v-if="editingVideoId !== video.id" class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-sm text-gray-300 font-medium truncate">{{ video.label || 'Vidéo sans titre' }}</span>
                <button @click="startEditVideo(video)" title="Modifier le titre"
                  class="p-1 text-gray-500 hover:text-gray-300 transition-colors rounded flex-shrink-0">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14H8v-2a2 2 0 01.586-1.414z" />
                  </svg>
                </button>
              </div>
              <div v-else class="flex items-center gap-2 flex-1 min-w-0">
                <input v-model="editingVideoLabel" @keydown.enter="saveVideoTitle(video.id)" @keydown.escape="editingVideoId = null"
                  class="bg-gray-600 border border-purple-500 rounded px-2 py-0.5 text-white text-sm focus:outline-none flex-1 min-w-0" autofocus />
                <button @click="saveVideoTitle(video.id)" class="px-2 py-0.5 bg-purple-600 text-white text-xs rounded">OK</button>
                <button @click="editingVideoId = null" class="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded">✕</button>
              </div>
              <button @click="deleteVideo(video.id)"
                class="p-1 text-gray-400 hover:text-red-400 transition-colors rounded flex-shrink-0 ml-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="aspect-video">
              <iframe :src="`https://www.youtube.com/embed/${extractYoutubeId(video.url)}`"
                class="w-full h-full" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen />
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Barre de sauvegarde flottante -->
    <Teleport to="body">
      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div class="bg-gray-900 border border-gray-700 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl pointer-events-auto">
          <Transition name="fade">
            <span v-if="saveSuccess" class="text-green-400 text-sm font-medium">✓ Sauvegardé</span>
            <span v-else-if="saveError" class="text-red-400 text-sm">{{ saveError }}</span>
          </Transition>
          <button @click="saveRun" :disabled="saving"
            class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
            {{ saving ? 'Sauvegarde...' : '💾 Sauvegarder' }}
          </button>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { getBossRun, upsertBossRun, toggleChallenge, getChallengeTypes } = useChallenges()
const { updateBoss } = useBosses()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const bossId = route.params.id as string

const { data: boss, pending, refresh: refreshBoss } = await useAsyncData(`boss-${bossId}`, async () => {
  const { data } = await supabase.from('bosses').select('*').eq('id', bossId).eq('user_id', user.value!.id).single()
  return data
})

const { data: challengeTypes } = await useAsyncData('challenge-types', getChallengeTypes)
const { data: bossRun, refresh: refreshRun } = await useAsyncData(`boss-run-${bossId}`, () => getBossRun(bossId))

// Avatar
const colors = ['#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0284c7', '#9333ea']
const avatarColor = computed(() => colors[(boss.value?.name?.charCodeAt(0) ?? 0) % colors.length])
const initials = computed(() =>
  (boss.value?.name ?? '').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
)

// Edit nom
const editingName = ref(false)
const newName = ref('')
const startEditName = () => { newName.value = boss.value?.name ?? ''; editingName.value = true }
const saveName = async () => {
  if (!newName.value.trim()) return
  await updateBoss(bossId, { name: newName.value.trim() })
  await refreshBoss()
  editingName.value = false
}

// Onglets image
const imageTabs = [
  { id: 'search', label: '🔍 Recherche' },
  { id: 'upload', label: '📁 Upload' },
  { id: 'url', label: '🔗 URL' },
]
const imageTab = ref<'search' | 'upload' | 'url'>('search')

// Recherche
const imageResults = ref<string[]>([])
const imageSearchLoading = ref(false)
const imageSearchError = ref('')
const imageSearchQuery = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(imageSearchQuery, (val) => {
  if (imageTab.value !== 'search') return
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) return
  debounceTimer = setTimeout(() => searchImages(), 1500)
})

const searchImages = async () => {
  if (!imageSearchQuery.value.trim()) return
  imageSearchLoading.value = true
  imageSearchError.value = ''
  imageResults.value = []
  try {
    const data = await $fetch<any>(`/api/search-serper-images?q=${encodeURIComponent(imageSearchQuery.value.trim())}`)
    if (data.error) { imageSearchError.value = `Erreur: ${data.error}`; return }
    imageResults.value = data.images ?? []
    if (imageResults.value.length === 0) imageSearchError.value = 'Aucune image trouvée'
  } catch (e: any) {
    imageSearchError.value = e.message
  } finally {
    imageSearchLoading.value = false
  }
}

// Upload
const uploadLoading = ref(false)
const uploadError = ref('')

const handleUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadLoading.value = true
  uploadError.value = ''
  try {
    const path = `${user.value!.id}/${bossId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('images').upload(path, file, { upsert: true })
    if (error) throw error
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
    newImageUrl.value = urlData.publicUrl
  } catch (e: any) {
    uploadError.value = e.message
  } finally {
    uploadLoading.value = false
  }
}

const getGameNameById = async (gameId: string) => {
  const { data } = await supabase.from('games').select('name').eq('id', gameId).single()
  return data?.name ?? ''
}

const selectImage = (url: string) => {
  newImageUrl.value = url
}

// Edit image + position
const editingImage = ref(false)
const imgError = ref(false)
const newImageUrl = ref(boss.value?.image_url ?? '')
const imagePosition = ref(boss.value?.image_position ?? 'center center')

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
  await updateBoss(bossId, { image_url: newImageUrl.value || null, image_position: imagePosition.value })
  await refreshBoss()
  editingImage.value = false
}

// Run
const toMinutes = (sec: number | null) => sec ? Math.round((sec / 60) * 10) / 10 : null
const toSeconds = (min: number | null) => min ? Math.round(min * 60) : null

const form = reactive({
  completed: bossRun.value?.completed ?? false,
  attempts: bossRun.value?.attempts ?? 0,
  best_time_minutes: toMinutes(bossRun.value?.best_time_seconds ?? null),
  notes: bossRun.value?.notes ?? '',
})

watch(bossRun, (run) => {
  if (run) {
    form.completed = run.completed
    form.attempts = run.attempts
    form.best_time_minutes = toMinutes(run.best_time_seconds)
    form.notes = run.notes ?? ''
  }
})

const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

const saveRun = async () => {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''
  try {
    await upsertBossRun(bossId, {
      completed: form.completed,
      attempts: form.attempts || 0,
      best_time_seconds: toSeconds(form.best_time_minutes),
      notes: form.notes || null,
    })
    await refreshRun()
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 2000)
  } catch (e: any) {
    saveError.value = e.message ?? 'Erreur lors de la sauvegarde'
  } finally {
    saving.value = false
  }
}

const isChallengeCompleted = (challengeTypeId: string) =>
  bossRun.value?.challenge_completions?.some((cc: any) => cc.challenge_type_id === challengeTypeId && cc.completed) ?? false

const toggleChallengeHandler = async (challengeTypeId: string, completed: boolean) => {
  if (!bossRun.value) return
  await toggleChallenge(bossRun.value.id, challengeTypeId, completed)
  await refreshRun()
}

// Vidéos
const videos = ref<any[]>([])
const showAddVideo = ref(false)
const newVideoUrl = ref('')
const newVideoLabel = ref('')
const videoError = ref('')
const editingVideoId = ref<string | null>(null)
const editingVideoLabel = ref('')

const startEditVideo = (video: any) => {
  editingVideoId.value = video.id
  editingVideoLabel.value = video.label ?? ''
}

const saveVideoTitle = async (videoId: string) => {
  await supabase.from('boss_videos').update({ label: editingVideoLabel.value.trim() || null }).eq('id', videoId)
  editingVideoId.value = null
  await loadVideos()
}

const extractYoutubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

const loadVideos = async () => {
  const { data } = await supabase.from('boss_videos').select('*')
    .eq('boss_id', bossId).eq('user_id', user.value!.id).order('created_at')
  videos.value = data ?? []
}

const addVideo = async () => {
  videoError.value = ''
  const id = extractYoutubeId(newVideoUrl.value)
  if (!id) {
    videoError.value = 'URL YouTube invalide'
    return
  }
  await supabase.from('boss_videos').insert({
    boss_id: bossId,
    user_id: user.value!.id,
    url: newVideoUrl.value.trim(),
    label: newVideoLabel.value.trim() || null,
  })
  newVideoUrl.value = ''
  newVideoLabel.value = ''
  showAddVideo.value = false
  await loadVideos()
}

const deleteVideo = async (videoId: string) => {
  await supabase.from('boss_videos').delete().eq('id', videoId)
  await loadVideos()
}

await loadVideos()
</script>
