import React, { useState } from 'react'
import clsx from 'clsx'
import { ArrowUpRight, ArrowDownRight, Search } from 'lucide-react'

/**
 * PositionsTable — renders a list of positions as a styled data grid.
 *
 * Props:
 *   positions {Array} - Active position objects from mock data / store
 */
export default function PositionsTable({ positions }) {
  const [search, setSearch] = useState('')

  const filtered = positions.filter((p) =>
    p.question.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Table header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-white">Active Positions</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3 border border-border">
          <Search size={12} className="text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter markets..."
            className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-40"
          />
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_80px_90px_90px_100px] gap-x-3 px-4 py-2 border-b border-border/50 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        <span>Market</span>
        <span className="text-right">Side</span>
        <span className="text-right">Avg Price</span>
        <span className="text-right">Current</span>
        <span className="text-right">Unrealized PnL</span>
      </div>

      {/* Rows */}
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm text-slate-500">
            No positions match your filter.
          </div>
        ) : (
          filtered.map((pos) => {
            const pnl = (pos.current_price - pos.avg_price) * pos.shares
            const isProfit = pnl >= 0
            const pctChange = (((pos.current_price - pos.avg_price) / pos.avg_price) * 100).toFixed(1)

            return (
              <div
                key={pos.market_id}
                className="grid grid-cols-[1fr_80px_90px_90px_100px] gap-x-3 px-4 py-3 border-b border-border/30 hover:bg-surface-3/50 transition-colors duration-100 items-center animate-slide_in"
              >
                {/* Market name */}
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium truncate">{pos.question}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {pos.shares} shares · {pos.category}
                  </p>
                </div>

                {/* Side badge */}
                <div className="flex justify-end">
                  <span className={pos.side === 'YES' ? 'badge-yes' : 'badge-no'}>
                    {pos.side}
                  </span>
                </div>

                {/* Avg price */}
                <p className="text-right text-xs font-mono text-slate-300">
                  ${pos.avg_price.toFixed(3)}
                </p>

                {/* Current price */}
                <p className={clsx('text-right text-xs font-mono', isProfit ? 'text-profit' : 'text-loss')}>
                  ${pos.current_price.toFixed(3)}
                </p>

                {/* Unrealized PnL */}
                <div className="flex flex-col items-end">
                  <span className={clsx('flex items-center gap-0.5 text-xs font-mono font-semibold', isProfit ? 'text-profit' : 'text-loss')}>
                    {isProfit ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {isProfit ? '+' : ''}${pnl.toFixed(2)}
                  </span>
                  <span className={clsx('text-[10px] font-mono', isProfit ? 'text-emerald-600' : 'text-rose-600')}>
                    {isProfit ? '+' : ''}{pctChange}%
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
