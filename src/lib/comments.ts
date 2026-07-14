import { createClient } from '@/lib/supabase/server'

export interface CommentData {
  id: string
  author_name: string
  content: string
  created_at: string
}

export async function getApprovedComments(articleId: string): Promise<CommentData[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('id, author_name, content, created_at')
    .eq('article_id', articleId)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data
}
