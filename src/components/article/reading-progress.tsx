'use client'

import { useEffect, useState, useRef } from 'react'

interface Props {
  targetId: string
}

export function ReadingProgress({ targetId }: Props) {
  const [progress, setProgress] = useState(0)
  const ticking = useRef(false)

  useEffect(() => {
    function updateProgress() {
      const target = document.getElementById(targetId)
      if (!target) return

      const rect = target.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const totalScrollable = rect.height - viewportHeight + rect.top

      // Koliko je pređeno od vrha teksta do sada, u odnosu na ukupnu visinu teksta
      const scrolled = -rect.top
      const percent = totalScrollable > 0 ? Math.min(100, Math.max(0, (scrolled / totalScrollable) * 100)) : 0

      setProgress(percent)
      ticking.current = false
    }

    function onScroll() {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(updateProgress)
      }
    }

    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [targetId])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gray-200/50 dark:bg-gray-800/50">
      <div
        className="h-full bg-brand-red transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
