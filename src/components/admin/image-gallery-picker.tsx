'use client'

import { useEffect, useState } from 'react'
import { Images, X, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onSelect: (url: string) => void
}

interface StoredImage {
  name: string
  url: string
}

export function ImageGalleryPicker({ onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<StoredImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadImages() {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: listError } = await supabase.storage
      .from('article-images')
      .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

    if (listError) {
      setError('Greška prilikom učitavanja slika.')
      setLoading(false)
      return
    }

    const files = (data ?? []).filter((f) => f.id) // filtrira foldere/placeholder unose
    const withUrls = files.map((f) => ({
      name: f.name,
      url: supabase.storage.from('article-images').getPublicUrl(f.name).data.publicUrl,
    }))

    setImages(withUrls)
    setLoading(false)
  }

  function handleOpen() {
    setOpen(true)
    loadImages()
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-red text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
      >
        <Images className="w-3.5 h-3.5" />
        Izaberi već otpremljenu sliku
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-sm">Otpremljene slike</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}

              {!loading && error && <p className="text-center text-red-500 text-sm py-8">{error}</p>}

              {!loading && !error && images.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">Još uvek nema otpremljenih slika.</p>
              )}

              {!loading && !error && images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => {
                        onSelect(img.url)
                        setOpen(false)
                      }}
                      className="group relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-brand-red transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
