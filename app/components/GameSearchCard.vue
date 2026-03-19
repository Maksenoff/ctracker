<template>
  <div class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-600 transition-all flex flex-col">
    <!-- Cover -->
    <div class="aspect-video bg-gray-700 overflow-hidden">
      <img
        v-if="game.background_image"
        :src="game.background_image"
        :alt="game.name"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-3xl font-black text-gray-600">
        {{ initials }}
      </div>
    </div>

    <!-- Infos -->
    <div class="p-3 flex flex-col gap-2 flex-1">
      <p class="font-semibold text-sm leading-tight line-clamp-2">{{ game.name }}</p>
      <div class="flex items-center gap-2 text-xs text-gray-400 mt-auto">
        <span v-if="game.released">{{ game.released.slice(0, 4) }}</span>
        <span v-if="game.metacritic" class="ml-auto bg-green-800 text-green-300 px-1.5 py-0.5 rounded font-bold">
          {{ game.metacritic }}
        </span>
      </div>
      <button
        @click="$emit('add')"
        :disabled="added"
        class="w-full py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="added
          ? 'bg-gray-700 text-gray-500 cursor-default'
          : 'bg-purple-600 hover:bg-purple-700 text-white'"
      >
        {{ added ? '✓ Ajouté' : '+ Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ game: any; added: boolean }>()
defineEmits(['add'])

const initials = computed(() =>
  props.game.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
)
</script>
