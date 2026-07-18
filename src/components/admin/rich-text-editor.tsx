'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, Heading2, Heading3, Link as LinkIcon, List, ListOrdered,
  Quote, Code2, Eye, Undo2,
} from 'lucide-react'
import { ImageUploadButton } from '@/components/admin/image-upload-button'
import { ImageGalleryPicker } from '@/components/admin/image-gallery-picker'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (html: string) => void
}

/**
 * Editor sa dva režima, kao na WordPress-u:
 * - "Vizuelno": contentEditable, WYSIWYG, sa toolbar-om
 * - "Kod": sirov HTML u textarea-i (za napredne izmene)
 *
 * Lepljenje teksta (npr. iz Word-a) se namerno pretvara u čist tekst
 * podeljen u pasuse — sprečava haos od skrivenog Word markup-a koji bi
 * inače sve zbio bez razmaka.
 */
export function RichTextEditor({ value, onChange }: Props) {
  const [mode, setMode] = useState<'visual' | 'code'>('visual')
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const initialized = useRef(false)

  // Postavi sadržaj u vizuelni editor SAMO pri montiranju / promeni režima —
  // ne pri svakom kucanju (contentEditable mora biti "uncontrolled" da kursor ne skače).
  useEffect(() => {
    if (mode === 'visual' && editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value
      initialized.current = true
    }
  }, [mode, value])

  function syncFromEditor() {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  function exec(command: string, arg?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, arg)
    syncFromEditor()
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    // Podeli nalepljeni tekst u pasuse po praznim redovima, umesto da sve slepi zajedno
    const paragraphs = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('')

    document.execCommand('insertHTML', false, paragraphs || text)
    syncFromEditor()
  }

  function insertImage(url: string) {
    // Alt tekst je obavezan za svaku sliku, ne samo naslovnu — bitno za
    // pristupačnost i SEO. Ne dozvoljavamo ubacivanje slike bez njega.
    let altText = ''
    while (!altText.trim()) {
      const input = prompt('Unesi alt tekst za ovu sliku (obavezno, opisuje sliku za pretraživače i osobe sa oštećenim vidom):')
      if (input === null) return // korisnik je otkazao — slika se ne ubacuje
      altText = input
    }

    const imgHtml = `<img src="${url}" alt="${altText.replace(/"/g, '&quot;')}" style="width:100%;border-radius:0.75rem;margin:1.5rem 0;" />`

    if (mode === 'visual') {
      editorRef.current?.focus()
      document.execCommand('insertHTML', false, imgHtml)
      syncFromEditor()
      return
    }

    // Code režim — ubaci na poziciju kursora u textarea-i
    const textarea = textareaRef.current
    const tag = `\n${imgHtml}\n`
    if (!textarea) {
      onChange(value + tag)
      return
    }
    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    onChange(value.slice(0, start) + tag + value.slice(end))
    setTimeout(() => {
      textarea.focus()
      const pos = start + tag.length
      textarea.setSelectionRange(pos, pos)
    }, 0)
  }

  function switchMode(next: 'visual' | 'code') {
    if (next === mode) return
    if (next === 'code') {
      // Vizuelno -> Kod: uzmi trenutni HTML iz editora
      if (editorRef.current) onChange(editorRef.current.innerHTML)
    } else {
      // Kod -> Vizuelno: pri sledećem renderu ponovo napuni editor
      initialized.current = false
    }
    setMode(next)
  }

  const toolbarBtn = 'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Tabovi Vizuelno / Kod */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2">
        <div className="flex">
          <button
            type="button"
            onClick={() => switchMode('visual')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors',
              mode === 'visual' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Eye className="w-3.5 h-3.5" /> Vizuelno
          </button>
          <button
            type="button"
            onClick={() => switchMode('code')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors',
              mode === 'code' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Code2 className="w-3.5 h-3.5" /> Kod
          </button>
        </div>
      </div>

      {/* Toolbar — samo u vizuelnom režimu */}
      {mode === 'visual' && (
        <div className="flex items-center flex-wrap gap-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 py-1.5">
          <button type="button" title="Podebljano" onClick={() => exec('bold')} className={toolbarBtn}><Bold className="w-4 h-4" /></button>
          <button type="button" title="Kurziv" onClick={() => exec('italic')} className={toolbarBtn}><Italic className="w-4 h-4" /></button>
          <button type="button" title="Naslov" onClick={() => exec('formatBlock', 'H2')} className={toolbarBtn}><Heading2 className="w-4 h-4" /></button>
          <button type="button" title="Podnaslov" onClick={() => exec('formatBlock', 'H3')} className={toolbarBtn}><Heading3 className="w-4 h-4" /></button>
          <button
            type="button"
            title="Link"
            onClick={() => {
              const url = prompt('Unesi URL:')
              if (url) exec('createLink', url)
            }}
            className={toolbarBtn}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button type="button" title="Lista" onClick={() => exec('insertUnorderedList')} className={toolbarBtn}><List className="w-4 h-4" /></button>
          <button type="button" title="Numerisana lista" onClick={() => exec('insertOrderedList')} className={toolbarBtn}><ListOrdered className="w-4 h-4" /></button>
          <button type="button" title="Citat" onClick={() => exec('formatBlock', 'BLOCKQUOTE')} className={toolbarBtn}><Quote className="w-4 h-4" /></button>
          <button type="button" title="Poništi" onClick={() => exec('undo')} className={toolbarBtn}><Undo2 className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
          <div className="w-44">
            <ImageUploadButton onUploaded={insertImage} />
          </div>
          <div className="w-48">
            <ImageGalleryPicker onSelect={insertImage} />
          </div>
        </div>
      )}

      {/* Editor / Code textarea */}
      {mode === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncFromEditor}
          onPaste={handlePaste}
          className="prose prose-sm dark:prose-invert max-w-none w-full min-h-[320px] px-4 py-3 text-sm bg-white dark:bg-gray-900 focus:outline-none"
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          placeholder="Unesite HTML tekst vesti..."
          className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none resize-y font-mono"
        />
      )}
    </div>
  )
}
