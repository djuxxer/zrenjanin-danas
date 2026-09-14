'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, Heading2, Heading3, Link as LinkIcon, List, ListOrdered,
  Quote, Code2, Eye, Undo2, X,
} from 'lucide-react'
import { ImageUploadButton } from '@/components/admin/image-upload-button'
import { ImageGalleryPicker } from '@/components/admin/image-gallery-picker'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (html: string) => void
  isAdmin?: boolean
  excludeId?: string
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
export function RichTextEditor({ value, onChange, isAdmin = false, excludeId }: Props) {
  const [mode, setMode] = useState<'visual' | 'code'>('visual')
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const initialized = useRef(false)

  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
  const [linkQuery, setLinkQuery] = useState('')
  const [linkAnchorText, setLinkAnchorText] = useState('')
  const [linkResults, setLinkResults] = useState<{ id: string; title: string; slug: string }[]>([])
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkManualUrl, setLinkManualUrl] = useState('')
  const [linkDofollow, setLinkDofollow] = useState(false)
  const savedRangeRef = useRef<Range | null>(null)

  // Postavi sadržaj u vizuelni editor SAMO pri montiranju / promeni režima —
  // ne pri svakom kucanju (contentEditable mora biti "uncontrolled" da kursor ne skače).
  useEffect(() => {
    if (mode === 'visual' && editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value
      initialized.current = true
    }
  }, [mode, value])

  function syncFromEditor() {
    if (!editorRef.current) return
    // Ukloni prazne pasuse (nastaju kad se dva puta pritisne Enter) — bez ovoga
    // svaki prazan <p> dobija sopstvenu marginu i pravi utisak "duplog razmaka"
    // koji se ne poklapa sa onim što se vidi kad je vest objavljena.
    const cleaned = editorRef.current.innerHTML.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    onChange(cleaned)
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

  function openLinkPopover() {
    const selection = window.getSelection()
    const text = selection?.toString() ?? ''

    // Sačuvaj tačnu poziciju selekcije da je vratimo kasnije — klik na predlog
    // u popover-u premešta fokus van editora, pa bi se selekcija inače izgubila.
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange()
    }

    setLinkAnchorText(text)
    setLinkQuery(text)
    setLinkManualUrl('')
    setLinkDofollow(false)
    setLinkResults([])
    setLinkPopoverOpen(true)
    if (text.trim().length > 2) searchLinks(text)
  }

  async function searchLinks(query: string) {
    if (query.trim().length < 3) {
      setLinkResults([])
      return
    }
    setLinkLoading(true)
    try {
      const res = await fetch('/api/admin/suggest-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: query, excludeId }),
      })
      const data = await res.json()
      setLinkResults(data.articles ?? [])
    } catch {
      setLinkResults([])
    }
    setLinkLoading(false)
  }

  function restoreSelection() {
    editorRef.current?.focus()
    if (savedRangeRef.current) {
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(savedRangeRef.current)
    }
  }

  function insertLink(href: string, text: string) {
    restoreSelection()
    const escapedText = text.trim() || href
    const relAttr = isAdmin && linkDofollow ? ' data-dofollow="true"' : ''
    document.execCommand('insertHTML', false, `<a href="${href}"${relAttr}>${escapedText}</a>`)
    syncFromEditor()
    setLinkPopoverOpen(false)
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
            onClick={openLinkPopover}
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

      {/* Popover za ubacivanje linka — pretraga po selektovanom tekstu, kao na WordPress-u */}
      {linkPopoverOpen && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {linkAnchorText ? `Link za: "${linkAnchorText}"` : 'Ubaci link'}
            </p>
            <button type="button" onClick={() => setLinkPopoverOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="text"
            value={linkQuery}
            onChange={(e) => {
              setLinkQuery(e.target.value)
              searchLinks(e.target.value)
            }}
            placeholder="Pretraži postojeće vesti..."
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
          />

          {linkLoading && <p className="text-xs text-gray-400">Pretražujem...</p>}

          {!linkLoading && linkResults.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {linkResults.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => insertLink(`/vest/${r.slug}`, linkAnchorText || r.title)}
                  className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 line-clamp-1"
                >
                  {r.title}
                </button>
              ))}
            </div>
          )}

          {!linkLoading && linkQuery.trim().length > 2 && linkResults.length === 0 && (
            <p className="text-xs text-gray-400">Nema postojećih vesti sa tim rečima.</p>
          )}

          <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex items-center gap-2">
            <input
              type="text"
              value={linkManualUrl}
              onChange={(e) => setLinkManualUrl(e.target.value)}
              placeholder="...ili nalepi URL ručno"
              className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
            />
            <button
              type="button"
              disabled={!linkManualUrl.trim()}
              onClick={() => insertLink(linkManualUrl.trim(), linkAnchorText)}
              className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              Ubaci
            </button>
          </div>

          {isAdmin && (
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer pt-1">
              <input type="checkbox" checked={linkDofollow} onChange={(e) => setLinkDofollow(e.target.checked)} className="w-3.5 h-3.5 accent-brand-red" />
              Dofollow (prenosi SEO vrednost) — samo za admin
            </label>
          )}
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
          className="article-content max-w-none w-full min-h-[320px] px-4 py-3 text-sm bg-white dark:bg-gray-900 focus:outline-none"
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
