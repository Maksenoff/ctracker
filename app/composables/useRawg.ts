export const useRawg = () => {
  const config = useRuntimeConfig()
  const apiKey = config.public.rawgApiKey

  const searchGames = async (query: string, page = 1) => {
    if (!query.trim()) return { results: [], count: 0 }
    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page=${page}&page_size=12&search_precise=true`
    const data = await $fetch<any>(url)
    return { results: data.results ?? [], count: data.count ?? 0 }
  }

  const getPopularGames = async () => {
    const url = `https://api.rawg.io/api/games?key=${apiKey}&ordering=-metacritic&page_size=12&metacritic=80,100`
    const data = await $fetch<any>(url)
    return data.results ?? []
  }

  const getGameScreenshots = async (gameName: string, extraSearch?: string) => {
    // Lance les deux recherches en parallèle si un terme supplémentaire est fourni
    const searchTerms = [gameName]
    if (extraSearch && extraSearch.toLowerCase() !== gameName.toLowerCase()) {
      searchTerms.push(`${extraSearch} ${gameName}`)
    }

    const allSearchResults = await Promise.all(
      searchTerms.map(term =>
        $fetch<any>(`https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(term)}&page_size=5&search_precise=false`)
          .then((d: any) => d.results ?? [])
          .catch(() => [])
      )
    )

    // Déduplique les jeux par id
    const seenIds = new Set<number>()
    const games: any[] = []
    allSearchResults.flat().forEach((game: any) => {
      if (!seenIds.has(game.id)) {
        seenIds.add(game.id)
        games.push(game)
      }
    })

    if (!games.length) return []

    // Récupère screenshots des 5 premiers jeux en parallèle
    const topGames = games.slice(0, 5)
    const allScreenshots = await Promise.all(
      topGames.map((game: any) =>
        $fetch<any>(`https://api.rawg.io/api/games/${game.id}/screenshots?key=${apiKey}&page_size=20`)
          .then((d: any) => d.results?.map((s: any) => s.image) ?? [])
          .catch(() => [])
      )
    )

    const images: string[] = []
    topGames.forEach((game: any) => {
      if (game.background_image) images.push(game.background_image)
      if (game.background_image_additional) images.push(game.background_image_additional)
    })
    allScreenshots.flat().forEach((url: string) => {
      if (!images.includes(url)) images.push(url)
    })

    return images
  }

  return { searchGames, getPopularGames, getGameScreenshots }
}
