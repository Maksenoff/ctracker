<template>
  <div>
    <!-- Hero -->
    <div class="text-center py-16">
      <div class="text-5xl mb-4">⚔️</div>
      <h1 class="text-5xl font-black text-white mb-4">
        Boss<span class="text-purple-400">Tracker</span>
      </h1>
      <p class="text-xl text-gray-300 mb-2 max-w-xl mx-auto">
        Centralise tes performances, suis ta progression et relève des défis sur chacun de tes boss.
      </p>
      <p class="text-gray-500 mb-10 max-w-lg mx-auto text-sm">
        No Hit, Level 1, Speed Run… Chaque défi validé te rapporte des points et construit ton score global.
      </p>
      <div class="flex gap-3 justify-center">
        <NuxtLink
          v-if="user"
          to="/dashboard"
          class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors"
        >
          Mon Dashboard →
        </NuxtLink>
        <NuxtLink
          v-else
          to="/login"
          class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors"
        >
          Commencer gratuitement →
        </NuxtLink>
      </div>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
      <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div class="text-3xl mb-3">🗂️</div>
        <h3 class="font-bold text-lg mb-2">Gestion des boss</h3>
        <p class="text-gray-400 text-sm">Organise tes boss par jeu. Ajoute, modifie ou supprime en quelques clics.</p>
      </div>
      <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div class="text-3xl mb-3">🏆</div>
        <h3 class="font-bold text-lg mb-2">Suivi des défis</h3>
        <p class="text-gray-400 text-sm">No Hit, No Damage, Level 1, Speed Run… Coche tes défis au fur et à mesure.</p>
      </div>
      <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div class="text-3xl mb-3">📊</div>
        <h3 class="font-bold text-lg mb-2">Score & progression</h3>
        <p class="text-gray-400 text-sm">Visualise ton taux de complétion par jeu et accumule des points sur chaque défi validé.</p>
      </div>
    </div>

    <!-- Comment ça marche -->
    <div class="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-16">
      <h2 class="text-2xl font-bold mb-6 text-center">Comment ça marche</h2>
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
        <div>
          <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold mx-auto mb-2">1</div>
          <p class="text-sm text-gray-300">Crée un jeu</p>
        </div>
        <div>
          <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold mx-auto mb-2">2</div>
          <p class="text-sm text-gray-300">Ajoute tes boss</p>
        </div>
        <div>
          <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold mx-auto mb-2">3</div>
          <p class="text-sm text-gray-300">Enregistre tes runs</p>
        </div>
        <div>
          <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold mx-auto mb-2">4</div>
          <p class="text-sm text-gray-300">Valide des défis</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
</script>
