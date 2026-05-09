/**
 * LiveTicker.jsx
 * Scrolling horizontal ticker bar showing live YES prices
 * for the user's open positions (from WebSocket).
 */

import React, { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import useStore from '../../store/useStore'

export default function LiveTicker() {
  const positions  = useStore((s) => s.positions)
  const livePrices = useStore((s) => s.livePrices)
  const trackRef   = useRef(null)

  // Duplicate items for seamless loop
  const items = [...positions, ...positions]

  return (
    <div className="relative flex items-center h-8 overflow-hidden bg-surface-1 border-b border-border">
      {/* Left fade */}
      <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-surface-1 to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-surface-1 to-transparent z-10 pointer-events-none" />

      <div
        ref={trackRef}
        className="flex items-center gap-6 px-4 whitespace-nowrap"
        style={{ animation: 'ticker-scroll 40s linear infinite' }}
      >
        {items.map((pos, i) => {
          const live = livePrices[pos.market_id] ?? pos.current_price
          const isUp = live >= pos.avg_price
          return (
            <span key={i} className="flex items-center gap-1.5 text-[11px] font-mono shrink-0">
              <span className="text-slate-500 truncate max-w-[160px]">
                {pos.question.length > 32 ? pos.question.slice(0, 32) + '…' : pos.question}
              </span>
              <span className={clsx('font-semibold', isUp ? 'text-profit' : 'text-loss')}>
                {isUp ? <ArrowUpRight size={10} className="inline" /> : <ArrowDownRight size={10} className="inline" />}
                {(live * 100).toFixed(1)}¢
              </span>
            </span>
          )
        })}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
