export const useChallenges = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const getChallengeTypes = async () => {
    const { data, error } = await supabase
      .from('challenge_types')
      .select('*')
      .or(`is_preset.eq.true,user_id.eq.${user.value!.id}`)
      .order('name')
    if (error) throw error
    return data
  }

  const getBossRun = async (bossId: string) => {
    const { data, error } = await supabase
      .from('boss_runs')
      .select('*, challenge_completions(*, challenge_types(*))')
      .eq('boss_id', bossId)
      .eq('user_id', user.value!.id)
      .maybeSingle()
    if (error) throw error
    return data
  }

  const upsertBossRun = async (bossId: string, run: {
    completed?: boolean
    attempts?: number
    best_time_seconds?: number | null
    notes?: string | null
  }) => {
    const { data: existing } = await supabase
      .from('boss_runs')
      .select('id')
      .eq('boss_id', bossId)
      .eq('user_id', user.value!.id)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('boss_runs')
        .update({ ...run, updated_at: new Date().toISOString(), completed_at: run.completed ? new Date().toISOString() : null })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('boss_runs')
        .insert({ ...run, boss_id: bossId, user_id: user.value!.id, completed_at: run.completed ? new Date().toISOString() : null })
        .select()
        .single()
      if (error) throw error
      return data
    }
  }

  const toggleChallenge = async (bossRunId: string, challengeTypeId: string, completed: boolean) => {
    const { error } = await supabase
      .from('challenge_completions')
      .upsert({
        boss_run_id: bossRunId,
        challenge_type_id: challengeTypeId,
        user_id: user.value!.id,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      }, { onConflict: 'boss_run_id,challenge_type_id' })
    if (error) throw error
  }

  const getGlobalStats = async () => {
    const [{ data: gameData, error }, { data: challengeData }] = await Promise.all([
      supabase.from('game_stats').select('*').eq('user_id', user.value!.id),
      supabase.from('challenge_completions')
        .select('challenge_types(points)')
        .eq('user_id', user.value!.id)
        .eq('completed', true)
    ])
    if (error) throw error

    const totalBosses = gameData?.reduce((s, g) => s + (g.total_bosses || 0), 0) ?? 0
    const completedBosses = gameData?.reduce((s, g) => s + (g.completed_bosses || 0), 0) ?? 0
    const totalChallenges = gameData?.reduce((s, g) => s + (g.total_challenges_done || 0), 0) ?? 0

    const bossPoints = completedBosses * 100
    const challengePoints = (challengeData ?? []).reduce((s: number, c: any) => s + (c.challenge_types?.points ?? 100), 0)
    const globalScore = bossPoints + challengePoints

    return { totalBosses, completedBosses, totalChallenges, globalScore, bossPoints, challengePoints, games: gameData ?? [] }
  }

  return { getChallengeTypes, getBossRun, upsertBossRun, toggleChallenge, getGlobalStats }
}
