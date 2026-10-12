import type { LiveResult, LiveTurnoutPoint } from '@/lib/live-shared'

// Grafikoni za "Uživo" prenos. Čist SVG/HTML bez dodatnih biblioteka, rade i u svetloj i u tamnoj temi.

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '').replace('.', ',')
}

// ───────────────────────── Izlaznost po satima ─────────────────────────

export function TurnoutChart({
  points,
  compareLabel = 'Prethodni izbori',
  compact = false,
}: {
  points: LiveTurnoutPoint[]
  compareLabel?: string
  /** Uža varijanta (za bočnu kolonu) — krupniji tekst pri manjoj širini */
  compact?: boolean
}) {
  if (points.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-10">
        Podaci o izlaznosti još nisu objavljeni.
      </div>
    )
  }

  const W = compact ? 420 : 640
  const H = compact ? 270 : 300
  const padL = 44
  const padR = 24
  const padT = 28
  const padB = 40
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const allValues = points.flatMap((p) => [p.percent, p.compare_percent ?? 0])
  const maxVal = Math.max(...allValues, 1)
  const yMax = maxVal > 90 ? 100 : Math.max(10, Math.ceil((maxVal * 1.15) / 10) * 10)

  const x = (i: number) =>
    points.length === 1 ? padL + innerW / 2 : padL + (innerW * i) / (points.length - 1)
  const y = (v: number) => padT + innerH - (v / yMax) * innerH

  const mainPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.percent)}`).join(' ')
  const comparePts = points
    .map((p, i) => ({ i, v: p.compare_percent }))
    .filter((p): p is { i: number; v: number } => p.v !== null)
  const comparePath = comparePts
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${x(p.i)},${y(p.v)}`)
    .join(' ')

  const ticks = Array.from({ length: 6 }, (_, i) => (yMax * i) / 5)
  const last = points[points.length - 1]

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto text-gray-500 dark:text-gray-400"
        role="img"
        aria-label={`Grafikon izlaznosti. Poslednja vrednost: ${fmt(last.percent)}% u ${last.label}.`}
      >
        {/* mreža + y osa */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(t)}
              y2={y(t)}
              stroke="currentColor"
              strokeOpacity={t === 0 ? 0.5 : 0.15}
            />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="currentColor">
              {fmt(t)}%
            </text>
          </g>
        ))}

        {/* poređenje (isprekidano) */}
        {comparePts.length > 1 && (
          <path
            d={comparePath}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.7}
            strokeWidth={2}
            strokeDasharray="6 5"
          />
        )}
        {comparePts.map((p) => (
          <circle key={`c${p.i}`} cx={x(p.i)} cy={y(p.v)} r={3.5} fill="currentColor" fillOpacity={0.7} />
        ))}

        {/* glavna linija */}
        <path
          d={mainPath}
          fill="none"
          className="stroke-[#0F2A5C] dark:stroke-[#6FA8DC]"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <g key={p.id}>
            <circle
              cx={x(i)}
              cy={y(p.percent)}
              r={5}
              className="fill-[#0F2A5C] dark:fill-[#6FA8DC] stroke-white dark:stroke-gray-900"
              strokeWidth={2}
            />
            <text
              x={x(i)}
              y={y(p.percent) - 12}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              className="fill-gray-900 dark:fill-white"
            >
              {fmt(p.percent)}%
            </text>
            <text x={x(i)} y={H - padB + 20} textAnchor="middle" fontSize="12" fill="currentColor">
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500 mt-1 px-1">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-0.5 bg-[#0F2A5C] dark:bg-[#6FA8DC]" /> Izlaznost
        </span>
        {comparePts.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed border-current" /> {compareLabel}
          </span>
        )}
      </div>
    </div>
  )
}

// ───────────────────────── Rezultati po listama ─────────────────────────

export function ResultsChart({
  results,
  threshold = 3,
}: {
  results: LiveResult[]
  threshold?: number | null
}) {
  if (results.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-10">
        Rezultati još nisu objavljeni.
      </div>
    )
  }

  const maxPct = Math.max(...results.map((r) => r.percent), threshold ?? 0, 1)
  const scaleMax = Math.max(10, Math.ceil((maxPct * 1.08) / 5) * 5)
  const hasSeats = results.some((r) => r.seats !== null)
  const hasVotes = results.some((r) => r.votes !== null)

  return (
    <div>
      <ul className="space-y-3">
        {results.map((r) => {
          const below = threshold !== null && r.percent < threshold
          return (
            <li key={r.id}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2 min-w-0">
                  <span
                    className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="truncate">{r.name}</span>
                </span>
                <span className="text-sm tabular-nums flex-shrink-0">
                  <strong className="text-gray-900 dark:text-white">{fmt(r.percent)}%</strong>
                  {hasVotes && r.votes !== null && (
                    <span className="text-gray-500 text-xs ml-2">
                      {r.votes.toLocaleString('sr-Latn-RS')} glasova
                    </span>
                  )}
                  {hasSeats && r.seats !== null && (
                    <span className="text-gray-500 text-xs ml-2">{r.seats} mand.</span>
                  )}
                </span>
              </div>
              <div className="relative h-5 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{
                    width: `${Math.min(100, (r.percent / scaleMax) * 100)}%`,
                    backgroundColor: r.color,
                    opacity: below ? 0.55 : 1,
                  }}
                />
                {threshold !== null && (
                  <div
                    className="absolute inset-y-0 border-l-2 border-dashed border-gray-500/70"
                    style={{ left: `${(threshold / scaleMax) * 100}%` }}
                    title={`Cenzus ${threshold}%`}
                  />
                )}
              </div>
            </li>
          )
        })}
      </ul>
      {threshold !== null && (
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
          <span className="inline-block h-3 border-l-2 border-dashed border-gray-500/70" />
          Izborni cenzus {threshold}%
        </p>
      )}
    </div>
  )
}
