/**
 * PerformanceMetrics.jsx
 * Derived quant metrics: Sharpe ratio, max drawdown, win streak, avg hold time.
 */

import React, { useMemo } from 'react'
import clsx from 'clsx'
import useStore from '../../store/useStore'

function calcMetrics(trades, pnlSeries) {
  if (!trades.length) return {}

  // Win rate
  const wins   = trades.filter((t) => t.realized_pnl > 0)
  const losses = trades.filter((t) => t.realized_pnl <= 0)
  const winRate = (wins.length / trades.length) * 100

  // Avg win / avg loss
  const avgWin  = wins.length  ? wins.reduce((s, t)   => s + t.realized_pnl, 0) / wins.length   : 0
  const avgLoss = losses.length ? losses.reduce((s, t) => s + t.realized_pnl, 0) / losses.length : 0

  // Profit factor
  const grossProfit = wins.reduce((s, t) => s + t.realized_pnl, 0)
  const grossLoss   = Math.abs(losses.reduce((s, t) => s + t.realized_pnl, 0))
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : '∞'

  // Max drawdown from PnL series
  let maxPnl = -Infinity, maxDrawdown = 0
  for (const p of pnlSeries) {
    if (p.pnl > maxPnl) maxPnl = p.pnl
    const dd = maxPnl - p.pnl
    if (dd > maxDrawdown) maxDrawdown = dd
  }

  // Sharpe (simplified, using daily PnL changes)
  const dailyReturns = pnlSeries.slice(1).map((p, i) => p.pnl - pnlSeries[i].pnl)
  const meanReturn = dailyReturns.reduce((s, r) => s + r, 0) / (dailyReturns.length || 1)
  const stdDev = Math.sqrt(
    dailyReturns.reduce((s, r) => s + Math.pow(r - meanReturn, 2), 0) / (dailyReturns.length || 1)
  )
  const sharpe = stdDev > 0 ? ((meanReturn / stdDev) * Math.sqrt(365)).toFixed(2) : '—'

  // Win streak
  let streak = 0, maxStreak = 0
  for (const t of [...trades].reverse()) {
    if (t.realized_pnl > 0) { streak++; maxStreak = Math.max(maxStreak, streak) }
    else streak = 0
  }

  return { winRate, avgWin, avgLoss, profitFactor, maxDrawdown, sharpe, maxStreak }
}

const Metric = ({ label, value, sub, color }) => (
  <div className="rounded-lg bg-surface-3 border border-border p-3 space-y-1">
    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
    <p className={clsx('text-lg font-semibold font-mono', color ?? 'text-white')}>{value}</p>
    {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
  </div>
)

export default function PerformanceMetrics() {
  const trades    = useStore((s) => s.tradeHistory)
  const pnlSeries = useStore((s) => s.pnlSeries)

  const m = useMemo(() => calcMetrics(trades, pnlSeries), [trades, pnlSeries])

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Performance Metrics</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Derived from closed positions</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Metric label="Win Rate"      value={`${m.winRate?.toFixed(1) ?? '—'}%`}
          color={m.winRate >= 50 ? 'text-profit' : 'text-loss'} sub="Trades in profit" />
        <Metric label="Sharpe Ratio"  value={m.sharpe ?? '—'}
          color={parseFloat(m.sharpe) >= 1 ? 'text-profit' : 'text-warn'} sub="Annualised (daily)" />
        <Metric label="Profit Factor" value={m.profitFactor ?? '—'}
          color={parseFloat(m.profitFactor) >= 1.5 ? 'text-profit' : 'text-warn'} sub="Gross P / Gross L" />
        <Metric label="Max Drawdown"  value={`$${m.maxDrawdown?.toFixed(2) ?? '—'}`}
          color="text-loss" sub="Peak-to-trough PnL" />
        <Metric label="Avg Win"       value={`+$${m.avgWin?.toFixed(2) ?? '—'}`}
          color="text-profit" sub="Per winning trade" />
        <Metric label="Win Streak"    value={m.maxStreak ?? '—'}
          color="text-neon-cyan" sub="Consecutive wins" />
      </div>
    </div>
  )
}
