export const useGames = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const getGames = async () => {
    const [statsRes, gamesRes] = await Promise.all([
      supabase.from('game_stats').select('*').eq('user_id', user.value!.id).order('game_name'),
      supabase.from('games').select('id, is_favorite').eq('user_id', user.value!.id)
    ])
    if (statsRes.error) throw statsRes.error
    const favMap = new Map(gamesRes.data?.map((g: any) => [g.id, g.is_favorite]))
    return statsRes.data?.map((g: any) => ({ ...g, is_favorite: favMap.get(g.game_id) ?? false })) ?? []
  }

  const createGame = async (name: string, cover_url?: string) => {
    const { data, error } = await supabase
      .from('games')
      .insert({ name, cover_url, user_id: user.value!.id })
      .select()
      .single()
    if (error) throw error
    return data
  }

  const setFavoriteGame = async (id: string, current: boolean) => {
    const { error } = await supabase.from('games').update({ is_favorite: !current }).eq('id', id).eq('user_id', user.value!.id)
    if (error) throw error
  }

  const updateGame = async (id: string, updates: { name?: string; cover_url?: string | null; image_position?: string; is_favorite?: boolean }) => {
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.value!.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const deleteGame = async (id: string) => {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id)
      .eq('user_id', user.value!.id)
    if (error) throw error
  }

  return { getGames, createGame, updateGame, deleteGame, setFavoriteGame }
}
