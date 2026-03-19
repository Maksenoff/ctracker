<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <nav class="border-b border-gray-800 bg-gray-900 px-6 py-3 flex items-center gap-1">
      <NuxtLink to="/" class="text-xl font-bold text-purple-400 tracking-tight mr-4">BossTracker</NuxtLink>
      <template v-if="user">
        <NuxtLink
          to="/dashboard"
          class="px-3 py-1.5 rounded-lg text-sm transition-colors"
          :class="route.path === '/dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/games"
          class="px-3 py-1.5 rounded-lg text-sm transition-colors"
          :class="route.path.startsWith('/games') || route.path.startsWith('/bosses') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'"
        >
          Mes Jeux
        </NuxtLink>
        <NuxtLink
          to="/search"
          class="px-3 py-1.5 rounded-lg text-sm transition-colors"
          :class="route.path === '/search' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'"
        >
          🔍 Rechercher
        </NuxtLink>
        <NuxtLink
          to="/friends"
          class="px-3 py-1.5 rounded-lg text-sm transition-colors"
          :class="route.path === '/friends' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'"
        >
          👥 Amis
        </NuxtLink>
      </template>
      <div class="ml-auto flex items-center gap-2">
        <NotificationBell v-if="user" />
        <AuthButton />
      </div>
    </nav>
    <main class="max-w-5xl mx-auto px-4 py-8">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const user = useSupabaseUser()
</script>
