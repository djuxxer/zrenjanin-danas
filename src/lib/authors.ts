import { createClient } from '@/lib/supabase/server'

export interface AuthorProfile {
  id: string
  full_name: string
  bio: string | null
  avatar_url: string | null
  role: 'admin' | 'urednik' | 'novinar'
}

export async function getAuthorById(id: string): Promise<AuthorProfile | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, bio, avatar_url, role')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return undefined
  return data
}
