export const useFriends = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const searchUsers = async (query: string) => {
    if (!query.trim()) return []
    const { data } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', `%${query.trim()}%`)
      .neq('id', user.value!.id)
      .limit(10)
    return data ?? []
  }

  const getFriendships = async () => {
    const { data } = await supabase
      .from('friendships')
      .select('*, requester:profiles!friendships_requester_id_fkey(id, username), addressee:profiles!friendships_addressee_id_fkey(id, username)')
      .or(`requester_id.eq.${user.value!.id},addressee_id.eq.${user.value!.id}`)
    return data ?? []
  }

  const sendFriendRequest = async (addresseeId: string) => {
    const { error } = await supabase.from('friendships').insert({
      requester_id: user.value!.id,
      addressee_id: addresseeId,
    })
    if (error) throw error
  }

  const acceptFriendRequest = async (friendshipId: string) => {
    const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    if (error) throw error
  }

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
    if (error) throw error
  }

  const getFriendshipWith = async (targetUserId: string) => {
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(requester_id.eq.${user.value!.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.value!.id})`)
      .maybeSingle()
    return data
  }

  const getPublicProfile = async (username: string) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', username)
      .limit(1)
      .maybeSingle()
    if (profileError) throw new Error(`profiles: ${profileError.message}`)
    if (!profile) throw new Error(`Aucun profil trouvé pour "${username}"`)


    const [statsRes, gamesRes] = await Promise.all([
      supabase.from('game_stats').select('*').eq('user_id', profile.id).order('game_name'),
      supabase.from('games').select('id, is_favorite').eq('user_id', profile.id)
    ])
    const favMap = new Map(gamesRes.data?.map((g: any) => [g.id, g.is_favorite]))
    const gameStats = statsRes.data?.map((g: any) => ({ ...g, is_favorite: favMap.get(g.game_id) ?? false }))

    const [{ data: bossRuns }, { data: featuredBosses }, { data: challengeData }] = await Promise.all([
      supabase.from('boss_runs').select(`
        id, completed, attempts, best_time_seconds,
        boss:boss_id(id, name, image_url, game_id),
        challenge_completions(completed, challenge_type:challenge_type_id(name, icon))
      `).eq('user_id', profile.id).eq('completed', true).order('updated_at', { ascending: false }),
      supabase.from('bosses').select('id, name, image_url, game_id').eq('user_id', profile.id).eq('is_featured', true),
      supabase.from('challenge_completions').select('challenge_types(points)').eq('user_id', profile.id).eq('completed', true)
    ])

    const totalBosses = bossRuns?.length ?? 0
    const totalChallenges = bossRuns?.reduce((acc: number, r: any) =>
      acc + (r.challenge_completions?.filter((c: any) => c.completed).length ?? 0), 0) ?? 0
    const bossPoints = totalBosses * 100
    const challengePoints = (challengeData ?? []).reduce((s: number, c: any) => s + (c.challenge_types?.points ?? 100), 0)
    const score = bossPoints + challengePoints

    return { profile, gameStats: gameStats ?? [], bossRuns: bossRuns ?? [], featuredBosses: featuredBosses ?? [], totalBosses, totalChallenges, score, bossPoints, challengePoints }
  }

  const getFriendsLeaderboard = async () => {
    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(id, username), addressee:profiles!friendships_addressee_id_fkey(id, username)')
      .or(`requester_id.eq.${user.value!.id},addressee_id.eq.${user.value!.id}`)
      .eq('status', 'accepted')

    const friends = (friendships ?? []).map((f: any) =>
      f.requester_id === user.value!.id ? f.addressee : f.requester
    ).filter(Boolean)

    const { data: selfProfile } = await supabase.from('profiles').select('id, username').eq('id', user.value!.id).single()
    const allUsers: any[] = [selfProfile, ...friends].filter(Boolean)
    const ids = allUsers.map((u: any) => u.id)

    const [{ data: bossRuns }, { data: challenges }] = await Promise.all([
      supabase.from('boss_runs').select('user_id').in('user_id', ids).eq('completed', true),
      supabase.from('challenge_completions').select('user_id, challenge_types(points)').in('user_id', ids).eq('completed', true)
    ])

    return allUsers.map((u: any) => {
      const bossCount = bossRuns?.filter((r: any) => r.user_id === u.id).length ?? 0
      const challengePts = challenges?.filter((c: any) => c.user_id === u.id).reduce((s: number, c: any) => s + (c.challenge_types?.points ?? 100), 0) ?? 0
      const score = bossCount * 100 + challengePts
      return { ...u, score, bossCount, isMe: u.id === user.value!.id }
    }).sort((a: any, b: any) => b.score - a.score)
  }

  return { searchUsers, getFriendships, sendFriendRequest, acceptFriendRequest, removeFriend, getFriendshipWith, getPublicProfile, getFriendsLeaderboard }
}
