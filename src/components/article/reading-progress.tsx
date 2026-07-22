'use client'

import { useEffect, useState, useRef } from 'react'

interface Props {
  targetId: string
}

export function ReadingProgress({ targetId }: Props) {
  const [progress, setProgress] = useState(0)
  const ticking = useRef(false)

  useEffect(() => {
    function update() {
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
    // Namerno "top-0" i visok z-index — traka se postavlja preko postojeće
    // trake sa vestima na vrhu, umesto da zauzima dodatan prostor (bitno na telefonu).
    <div className="fixed top-0 left-0 right-0 z-[70] h-[3px] bg-black/20">
      <div
        className="h-full bg-white shadow-[0_0_4px_rgba(0,0,0,0.4)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
