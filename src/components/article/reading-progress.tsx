'use client'

import { useEffect, useState, useRef } from 'react'

interface Props {
  targetId: string
}

export function ReadingProgress({ targetId }: Props) {
  const [progress, setProgress] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const ticking = useRef(false)

  useEffect(() => {
    function update() {
      // Meri trenutnu visinu header-a (menja se kad se otvori pretraga/mobilni meni)
      const header = document.querySelector('header')
      if (header) setHeaderHeight(header.getBoundingClientRect().height)

      const target = document.getElementById(targetId)
      if (!target) {
        ticking.current = false
        return
      }

      const rect = target.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const totalScrollable = rect.height - viewportHeight + rect.top

      const scrolled = -rect.top
      const percent = totalScrollable > 0 ? Math.min(100, Math.max(0, (scrolled / totalScrollable) * 100)) : 0

      setProgress(percent)
      ticking.current = false
    }

    function onScroll() {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [targetId])

  return (
    <div
      className="fixed left-0 right-0 z-40 h-1 bg-gray-200/50 dark:bg-gray-800/50 transition-[top] duration-200"
      style={{ top: `${headerHeight}px` }}
    >
      <div
        className="h-full bg-brand-red transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
