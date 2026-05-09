import React from 'react'
import PerformanceMetrics from '../components/analytics/PerformanceMetrics'
import WinRateChart from '../components/analytics/WinRateChart'
import EquityCurve from '../components/analytics/EquityCurve'
import useStore from '../store/useStore'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import clsx from 'clsx'

export default function Analytics() {
  const trades    = useStore((s) => s.tradeHistory)
  const positions = useStore((s) => s.positions)

  const totalRealized   = trades.reduce((s, t) => s + t.realized_pnl, 0)
  const totalUnrealized = positions.reduce((s, p) => s + (p.current_price - p.avg_price) * p.shares, 0)

  return (
    <div className="h-full overflow-y-auto px-6 py-5 space-y-5">

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Realized PnL',   val: `${totalRealized >= 0 ? '+' : ''}$${totalRealized.toFixed(2)}`,   color: totalRealized >= 0 ? 'text-profit' : 'text-loss' },
          { label: 'Unrealized PnL', val: `${totalUnrealized >= 0 ? '+' : ''}$${totalUnrealized.toFixed(2)}`, color: totalUnrealized >= 0 ? 'text-profit' : 'text-loss' },
          { label: 'Total Trades',   val: trades.length, color: 'text-neon-cyan' },
          { label: 'Open Positions', val: positions.length, color: 'text-neon-cyan' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
            <p className={clsx('text-xl font-semibold font-mono mt-1', color)}>{val}</p>
          </div>
        ))}
      </div>

      {/* Equity curve (full width) */}
      <EquityCurve />

      {/* Metrics + donut side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PerformanceMetrics />
        <WinRateChart />
      </div>

      {/* Trade breakdown table */}
      <div className="card p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Trade Breakdown</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">All closed positions sorted by PnL</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] font-medium uppercase tracking-wider text-slate-500 border-b border-border">
                <th className="text-left pb-2 pr-4">Market</th>
                <th className="text-center pb-2 pr-4">Side</th>
                <th className="text-right pb-2 pr-4">Entry</th>
                <th className="text-right pb-2 pr-4">Exit</th>
                <th className="text-right pb-2 pr-4">Shares</th>
                <th className="text-right pb-2">PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {[...trades]
                .sort((a, b) => b.realized_pnl - a.realized_pnl)
                .map((t) => (
                  <tr key={t.id} className="hover:bg-surface-3/40 transition-colors">
                    <td className="py-2.5 pr-4 text-slate-300 max-w-[200px] truncate">{t.question}</td>
                    <td className="py-2.5 pr-4 text-center">
                      <span className={t.side === 'YES' ? 'badge-yes' : 'badge-no'}>{t.side}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-slate-400">${t.entry.toFixed(3)}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-slate-400">${t.exit.toFixed(3)}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-slate-400">{t.shares}</td>
                    <td className={clsx('py-2.5 text-right font-mono font-semibold flex items-center justify-end gap-0.5',
                      t.realized_pnl >= 0 ? 'text-profit' : 'text-loss')}>
                      {t.realized_pnl >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {t.realized_pnl >= 0 ? '+' : ''}${t.realized_pnl.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
