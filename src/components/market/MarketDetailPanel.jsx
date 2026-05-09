/**
 * MarketDetailPanel.jsx
 * Slide-in detail panel for a selected market.
 * Shows live price chart, order book, and quick-action controls.
 */

import React, { useEffect } from 'react'
import clsx from 'clsx'
import { X, Bell, ExternalLink, TrendingUp, Droplets, Clock } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import useStore from '../../store/useStore'
import { usePriceHistory, useOrderBook } from '../../hooks/useMarkets'
import OrderBookViz from './OrderBookViz'
import Spinner from '../common/Spinner'

const fmt = (n) =>
  n >= 1_000_000 ? `$${(n/1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `$${(n/1_000).toFixed(1)}k`
  : `$${n?.toFixed(0) ?? '—'}`

const CustomTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-3 border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-mono font-semibold text-neon-cyan">{(payload[0].value * 100).toFixed(1)}%</p>
    </div>
  )
}

export default function MarketDetailPanel({ market, onClose }) {
  const livePrices    = useStore((s) => s.livePrices)
  const priceHistory  = useStore((s) => s.priceHistory)
  const phLoading     = useStore((s) => s.priceHistoryLoading)
  const addAlert      = useStore((s) => s.addAlert)
  const addNotification = useStore((s) => s.addNotification)

  // Fetch price history + order book for selected market
  usePriceHistory(market?.yesTokenId, 60)
  useOrderBook(market?.yesTokenId, 8_000)

  if (!market) return null

  const liveYes = livePrices[market.yesTokenId] ?? market.yesPrice
  const daysLeft = market.endDate
    ? Math.max(0, Math.ceil((new Date(market.endDate) - Date.now()) / 86_400_000))
    : null

  const handleAddAlert = () => {
    if (!market.yesTokenId) return
    const target = prompt(`Alert when YES price crosses (current: ${(liveYes*100).toFixed(1)}%):`, '0.75')
    if (!target) return
    const tp = parseFloat(target)
    if (isNaN(tp)) return
    addAlert({
      marketQuestion: market.question,
      tokenId: market.yesTokenId,
      targetPrice: tp,
      direction: tp > (liveYes ?? 0.5) ? 'above' : 'below',
    })
    addNotification({ level: 'info', message: `Alert set for "${market.question}" at $${tp.toFixed(3)}` })
  }

  return (
    <div className="flex flex-col h-full bg-surface-2 border-l border-border w-full">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-snug">{market.question}</p>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <TrendingUp size={9} /> {fmt(market.volume24h)} / 24h vol
            </span>
            <span className="flex items-center gap-1">
              <Droplets size={9} /> {fmt(market.liquidity)} liquidity
            </span>
            {daysLeft !== null && (
              <span className="flex items-center gap-1">
                <Clock size={9} /> {daysLeft}d remaining
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="btn-ghost p-1.5 shrink-0">
          <X size={14} />
        </button>
      </div>

      {/* Live price badges */}
      <div className="flex gap-3 px-4 py-3 border-b border-border">
        <div className="flex-1 rounded-lg bg-emerald-900/20 border border-emerald-800/40 p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">YES</p>
          <p className="text-xl font-mono font-semibold text-profit mt-1">
            {liveYes != null ? `${(liveYes * 100).toFixed(1)}¢` : '—'}
          </p>
        </div>
        <div className="flex-1 rounded-lg bg-rose-900/20 border border-rose-800/40 p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">NO</p>
          <p className="text-xl font-mono font-semibold text-loss mt-1">
            {market.noPrice != null ? `${(market.noPrice * 100).toFixed(1)}¢` : '—'}
          </p>
        </div>
      </div>

      {/* Price chart */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 mb-2">
          YES Price History (30d)
        </p>
        {phLoading ? (
          <div className="h-36 flex items-center justify-center">
            <Spinner size={20} className="text-neon-cyan" />
          </div>
        ) : priceHistory.length > 0 ? (
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceHistory} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#00e5ff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1c2030" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v*100).toFixed(0)}¢`} width={32} />
                <Tooltip content={<CustomTip />} />
                <Area type="monotone" dataKey="price" stroke="#00e5ff" strokeWidth={1.5}
                  fill="url(#mktGrad)" dot={false}
                  activeDot={{ r: 3, fill: '#00e5ff', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-36 flex items-center justify-center text-xs text-slate-500">
            Price history unavailable
          </div>
        )}
      </div>

      {/* Order book */}
      <div className="px-4 pb-2 flex-1 min-h-0 overflow-y-auto">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 mb-2">
          Order Book (YES)
        </p>
        <OrderBookViz tokenId={market.yesTokenId} />
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border flex gap-2">
        <button onClick={handleAddAlert} className="btn-ghost flex-1 flex items-center justify-center gap-2 text-xs">
          <Bell size={13} /> Set Alert
        </button>
        <a
          href={`https://polymarket.com/event/${market.slug}`}
          target="_blank" rel="noopener noreferrer"
          className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs"
        >
          <ExternalLink size={13} /> Open on Polymarket
        </a>
      </div>
    </div>
  )
}
