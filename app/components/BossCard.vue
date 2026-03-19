<template>
  <NuxtLink
    :to="`/bosses/${boss.id}`"
    class="block rounded-xl overflow-hidden border transition-all cursor-pointer relative min-h-[100px]"
    :class="boss.is_featured ? 'border-yellow-500/60 hover:border-yellow-400' : 'border-gray-700 hover:border-purple-500'"
  >
    <!-- Image de fond -->
    <div class="absolute inset-0">
      <img v-if="boss.image_url" :src="boss.image_url" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full" :style="{ backgroundColor: avatarColor }" />
    </div>

    <!-- Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

    <!-- Contenu -->
    <div class="relative p-4 flex flex-col min-h-[100px]">
      <!-- Badges haut -->
      <div class="flex items-start justify-between mb-auto">
        <span
          v-if="boss.boss_runs?.[0]?.completed"
          class="text-xs bg-purple-600/80 text-white px-2 py-0.5 rounded-full font-medium"
        >
          ✓ Complété
        </span>
        <span v-else class="text-xs bg-black/40 text-gray-300 px-2 py-0.5 rounded-full">En cours</span>

        <div class="flex items-center gap-1">
          <!-- Bouton pin (mode édition) -->
          <button v-if="showPin" @click.prevent="$emit('togglePin')" :title="boss.is_featured ? 'Retirer des favoris' : 'Mettre en avant'"
            :class="['p-1 rounded-lg transition-colors', boss.is_featured
              ? 'bg-yellow-500/80 text-white hover:bg-yellow-600'
              : 'bg-black/40 text-gray-400 hover:text-yellow-400 hover:bg-black/60']">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
          <button @click.prevent="$emit('delete')" title="Supprimer"
            class="p-1 rounded-lg bg-black/40 text-gray-300 hover:text-red-400 hover:bg-black/60 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Nom + essais en bas -->
      <div class="mt-4">
        <p class="font-bold text-white drop-shadow truncate">{{ boss.name }}</p>
        <p v-if="boss.boss_runs?.[0]?.attempts" class="text-xs text-white/60 mt-0.5">
          {{ boss.boss_runs[0].attempts }} essais
        </p>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ boss: any; showPin?: boolean }>()
defineEmits(['delete', 'togglePin'])

const colors = ['#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0284c7', '#9333ea', '#c026d3']
const avatarColor = computed(() => colors[(props.boss.name?.charCodeAt(0) ?? 0) % colors.length])
</script>
