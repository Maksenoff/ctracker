export const useBosses = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const getBossesByGame = async (gameId: string) => {
    const { data, error } = await supabase
      .from('bosses')
      .select('*, boss_runs(*)')
      .eq('game_id', gameId)
      .eq('user_id', user.value!.id)
      .order('order_index')
    if (error) throw error
    return data
  }

  const createBoss = async (boss: { game_id: string; name: string; image_url?: string; order_index?: number }) => {
    const { data, error } = await supabase
      .from('bosses')
      .insert({ ...boss, user_id: user.value!.id })
      .select()
      .single()
    if (error) throw error
    return data
  }

  const updateBoss = async (id: string, updates: { name?: string; image_url?: string | null; image_position?: string; is_featured?: boolean }) => {
    const { data, error } = await supabase
      .from('bosses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.value!.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const deleteBoss = async (id: string) => {
    const { error } = await supabase
      .from('bosses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.value!.id)
    if (error) throw error
  }

  return { getBossesByGame, createBoss, updateBoss, deleteBoss }
}
