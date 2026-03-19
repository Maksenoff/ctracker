<template>
  <div class="flex min-h-[70vh] items-center justify-center">
    <div class="bg-gray-800 rounded-2xl p-8 w-full max-w-sm">
      <h1 class="text-2xl font-bold text-center mb-6">BossTracker</h1>

      <!-- Toggle -->
      <div class="flex bg-gray-700 rounded-lg p-1 mb-6">
        <button @click="mode = 'login'" class="flex-1 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="mode === 'login' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'">
          Connexion
        </button>
        <button @click="mode = 'signup'" class="flex-1 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="mode === 'signup' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'">
          Créer un compte
        </button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="text-xs text-gray-400 uppercase tracking-wide">Email</label>
          <input v-model="email" type="email" required autofocus
            class="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            placeholder="ton@email.com" />
        </div>

        <!-- Pseudo (inscription uniquement) -->
        <div v-if="mode === 'signup'">
          <label class="text-xs text-gray-400 uppercase tracking-wide">Pseudo</label>
          <input v-model="username" type="text" required
            class="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            placeholder="ton_pseudo" />
        </div>

        <!-- Mot de passe -->
        <div>
          <label class="text-xs text-gray-400 uppercase tracking-wide">Mot de passe</label>
          <div class="relative mt-1">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:border-purple-500"
              placeholder="••••••••" />
            <button type="button" @click="showPassword = !showPassword"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors">
              <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Confirmation mot de passe (inscription uniquement) -->
        <div v-if="mode === 'signup'">
          <label class="text-xs text-gray-400 uppercase tracking-wide">Confirmer le mot de passe</label>
          <div class="relative mt-1">
            <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:border-purple-500"
              :class="confirmPassword && confirmPassword !== password ? 'border-red-500' : ''"
              placeholder="••••••••" />
          </div>
          <p v-if="confirmPassword && confirmPassword !== password" class="text-red-400 text-xs mt-1">
            Les mots de passe ne correspondent pas
          </p>
        </div>

        <p v-if="error" class="text-red-400 text-sm text-center">{{ error }}</p>

        <button type="submit" :disabled="loading || (mode === 'signup' && password !== confirmPassword)"
          class="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors">
          {{ loading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const { updateUsername } = useProfile()
const mode = ref<'login' | 'signup'>('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const username = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

watch(mode, () => {
  error.value = ''
  password.value = ''
  confirmPassword.value = ''
  username.value = ''
  showPassword.value = false
})

const submit = async () => {
  loading.value = true
  error.value = ''

  if (mode.value === 'login') {
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    if (err) error.value = err.message
    else navigateTo('/dashboard')
  } else {
    if (!username.value.trim()) { error.value = 'Le pseudo est requis.'; loading.value = false; return }
    const { data, error: err } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: { data: { username: username.value.trim() } }
    })
    if (err) {
      error.value = err.message
    } else if (data.user) {
      navigateTo('/dashboard')
    } else {
      error.value = 'Vérifie ton email pour confirmer ton compte.'
    }
  }

  loading.value = false
}
</script>
