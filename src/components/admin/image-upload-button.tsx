'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onUploaded: (url: string) => void
}

export function ImageUploadButton({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (file.size > 5 * 1024 * 1024) {
      setError('Slika je prevelika (max 5MB).')
      return
    }

    setUploading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setUploading(false)
      setError('Sesija je istekla — uloguj se ponovo.')
      return
    }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    setUploading(false)

    if (uploadError) {
      setError('Greška prilikom otpremanja: ' + uploadError.message)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('article-images').getPublicUrl(path)
    onUploaded(publicUrlData.publicUrl)

    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload-input"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-red text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {uploading ? 'Otpremanje...' : 'Otpremi sliku sa računara'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
