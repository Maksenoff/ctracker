<template>
  <form @submit.prevent="save" class="space-y-4">
    <div>
      <label class="text-xs text-gray-400 uppercase tracking-wide">Nom du jeu *</label>
      <input
        v-model="name"
        required
        autofocus
        class="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
        placeholder="ex: Elden Ring"
      />
    </div>
    <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
    <div class="flex gap-3 justify-end">
      <button type="button" @click="$emit('cancel')" class="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
        Annuler
      </button>
      <button type="submit" :disabled="saving" class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
        {{ saving ? 'Sauvegarde...' : 'Créer' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits(['saved', 'cancel'])
const { createGame } = useGames()

const name = ref('')
const saving = ref(false)
const error = ref('')

const save = async () => {
  saving.value = true
  error.value = ''
  try {
    const game = await createGame(name.value)
    emit('saved', game.id)
  } catch (e: any) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>
