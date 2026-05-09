/**
 * OrderBookViz.jsx
 * Live order book visualization.
 * Polls CLOB API every 5s for bids/asks and renders a depth chart.
 */

import React, { useMemo } from 'react'
import clsx from 'clsx'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import useStore from '../../store/useStore'
import { useOrderBook } from '../../hooks/useMarkets'
import Spinner from '../common/Spinner'

const MAX_LEVELS = 8

const OBTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-surface-3 border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-mono text-slate-300">${parseFloat(d.price).toFixed(4)}</p>
      <p className={clsx('font-semibold font-mono', d.side === 'bid' ? 'text-profit' : 'text-loss')}>
        {d.size} shares ({d.side.toUpperCase()})
      </p>
    </div>
  )
}

export default function OrderBookViz({ tokenId }) {
  useOrderBook(tokenId, 5_000)
  const orderBook = useStore((s) => s.orderBook)

  const { chartData, bestBid, bestAsk, spread } = useMemo(() => {
    if (!orderBook) return { chartData: [], bestBid: null, bestAsk: null, spread: null }

    const bids = (orderBook.bids ?? [])
      .slice(0, MAX_LEVELS)
      .map((b) => ({ price: b.price, size: parseFloat(b.size ?? b.quantity ?? 0), side: 'bid' }))

    const asks = (orderBook.asks ?? [])
      .slice(0, MAX_LEVELS)
      .reverse()
      .map((a) => ({ price: a.price, size: parseFloat(a.size ?? a.quantity ?? 0), side: 'ask' }))

    const bb = parseFloat(bids[0]?.price ?? 0)
    const ba = parseFloat(asks[asks.length - 1]?.price ?? 0)
    const sp = ba > 0 && bb > 0 ? (ba - bb).toFixed(4) : null

    return {
      chartData: [...asks, ...bids],
      bestBid: bb || null,
      bestAsk: ba || null,
      spread: sp,
    }
  }, [orderBook])

  if (!orderBook) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-slate-500 gap-2">
        <Spinner size={18} className="text-neon-cyan" />
        <p className="text-xs">Loading order book…</p>
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <p className="text-xs text-slate-500 text-center py-6">No order book data available.</p>
    )
  }

  return (
    <div className="space-y-3">
      {/* Best bid / ask / spread */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-emerald-900/20 border border-emerald-800/30 py-2">
          <p className="text-[10px] text-slate-500">Best Bid</p>
          <p className="text-xs font-mono text-profit font-semibold">{bestBid ? `$${bestBid.toFixed(4)}` : '—'}</p>
        </div>
        <div className="rounded-lg bg-surface-3 border border-border py-2">
          <p className="text-[10px] text-slate-500">Spread</p>
          <p className="text-xs font-mono text-warn font-semibold">{spread ? `$${spread}` : '—'}</p>
        </div>
        <div className="rounded-lg bg-rose-900/20 border border-rose-800/30 py-2">
          <p className="text-[10px] text-slate-500">Best Ask</p>
          <p className="text-xs font-mono text-loss font-semibold">{bestAsk ? `$${bestAsk.toFixed(4)}` : '—'}</p>
        </div>
      </div>

      {/* Depth bar chart */}
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="price"
              tick={{ fill: '#475569', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${parseFloat(v).toFixed(3)}`}
            />
            <YAxis hide />
            <Tooltip content={<OBTip />} />
            <Bar dataKey="size" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.side === 'bid' ? 'rgba(0,230,118,0.6)' : 'rgba(255,82,82,0.6)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Raw table (top 5 each side) */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div>
          <p className="text-profit mb-1 font-semibold">BIDS</p>
          {(orderBook.bids ?? []).slice(0, 5).map((b, i) => (
            <div key={i} className="flex justify-between text-slate-400">
              <span className="text-profit">{parseFloat(b.price).toFixed(4)}</span>
              <span>{parseFloat(b.size ?? b.quantity ?? 0).toFixed(1)}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-loss mb-1 font-semibold">ASKS</p>
          {(orderBook.asks ?? []).slice(0, 5).map((a, i) => (
            <div key={i} className="flex justify-between text-slate-400">
              <span className="text-loss">{parseFloat(a.price).toFixed(4)}</span>
              <span>{parseFloat(a.size ?? a.quantity ?? 0).toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
