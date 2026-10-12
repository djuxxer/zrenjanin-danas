import { createClient } from '@/lib/supabase/server'
import { fetchLiveBundle, type LiveBlog, type LiveBundle } from '@/lib/live-shared'

// Serverske funkcije za "Uživo" prenos

export async function getLiveBundleBySlug(slug: string): Promise<LiveBundle | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('live_blogs').select('id').eq('slug', slug).maybeSingle()
  if (!data) return null
  return fetchLiveBundle(supabase, data.id)
}

export async function getPublishedLiveBlogs(): Promise<LiveBlog[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('live_blogs')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  return (data ?? []) as LiveBlog[]
}

/** Prvi objavljeni prenos koji je trenutno aktivan (za traku na vrhu sajta). */
export async function getActiveLiveBlog(): Promise<Pick<LiveBlog, 'slug' | 'title'> | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('live_blogs')
    .select('slug, title')
    .eq('published', true)
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
}
