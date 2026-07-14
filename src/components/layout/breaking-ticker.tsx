'use client'

import { BREAKING_TICKER } from '@/lib/demo-data'

export function BreakingTicker() {
  const items = [...BREAKING_TICKER, ...BREAKING_TICKER]

  return (
    <div className="bg-brand-red text-white py-2 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-white text-brand-red font-extrabold text-xs uppercase tracking-widest px-4 py-0.5 mr-4 z-10">
          UŽIVO
        </div>
        <div className="ticker-wrap flex-1">
          <div className="ticker-content text-sm font-medium">
            {items.map((item, i) => (
              <span key={i} className="mr-16">
                <span className="mr-2 opacity-60">▶</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
