import React from 'react'
import clsx from 'clsx'
import { TrendingUp, Droplets, Clock, ChevronRight } from 'lucide-react'
import useStore from '../../store/useStore'

const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}k`
    : `$${n.toFixed(0)}`

const daysLeft = (endDate) => {
  if (!endDate) return null
  const diff = Math.ceil((new Date(endDate) - Date.now()) / 86_400_000)
  return diff > 0 ? diff : null
}

export default function MarketCard({ market, onSelect }) {
  const livePrices = useStore((s) => s.livePrices)

  const yesPrice = livePrices[market.yesTokenId] ?? market.yesPrice
  const noPrice  = livePrices[market.noTokenId]  ?? market.noPrice

  const yesPct  = yesPrice  != null ? Math.round(yesPrice * 100) : null
  const noPct   = noPrice   != null ? Math.round(noPrice * 100)  : null
  const days    = daysLeft(market.endDate)
  const isHot   = market.volume24h > 50_000

  return (
    <button
      onClick={() => onSelect?.(market)}
      className="card p-4 text-left hover:border-slate-600 hover:bg-surface-3/70 transition-all duration-150 group flex flex-col gap-3 w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-white leading-snug line-clamp-2 flex-1">
          {market.question}
        </p>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5 transition-colors" />
      </div>

      {/* Probability bar */}
      {yesPct !== null && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-profit">YES {yesPct}%</span>
            {noPct !== null && <span className="text-loss">NO {noPct}%</span>}
          </div>
          <div className="h-2 rounded-full bg-surface-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${yesPct}%`,
                background: `linear-gradient(90deg, #00e676 0%, ${yesPct > 70 ? '#00bcd4' : '#00e676'} 100%)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-auto">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <TrendingUp size={10} className={isHot ? 'text-neon-green' : ''} />
            {fmt(market.volume24h)} vol
          </span>
          <span className="flex items-center gap-1">
            <Droplets size={10} />
            {fmt(market.liquidity)} liq
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isHot && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/40 text-neon-green border border-emerald-800/50">
              🔥 HOT
            </span>
          )}
          {days !== null && (
            <span className="flex items-center gap-0.5">
              <Clock size={9} />
              {days}d left
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
