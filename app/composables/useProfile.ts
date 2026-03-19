export const useProfile = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const getProfile = async () => {
    if (!user.value) return null
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    return data
  }

  const updateUsername = async (username: string) => {
    if (!user.value) return
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.value.id, username: username.trim(), updated_at: new Date().toISOString() })
    if (error) throw error
  }

  return { getProfile, updateUsername }
}
