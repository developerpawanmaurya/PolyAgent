/**
 * EquityCurve.jsx
 * Composite chart: equity curve vs. drawdown below it.
 */

import React, { useMemo } from 'react'
import {
  ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import useStore from '../../store/useStore'

const CustomTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-3 border border-border rounded-lg px-3 py-2 text-xs shadow-xl space-y-1">
      <p className="text-slate-400">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-mono" style={{ color: p.color }}>
          {p.name}: {p.name === 'drawdown' ? '-' : ''}${Math.abs(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  )
}

export default function EquityCurve() {
  const pnlSeries = useStore((s) => s.pnlSeries)

  const data = useMemo(() => {
    let maxPnl = -Infinity
    return pnlSeries.map((p) => {
      if (p.pnl > maxPnl) maxPnl = p.pnl
      const drawdown = p.pnl < maxPnl ? -(maxPnl - p.pnl) : 0
      return { ...p, drawdown }
    })
  }, [pnlSeries])

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Equity Curve &amp; Drawdown</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">30-day cumulative PnL vs. peak-to-trough drawdown</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#00e676" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00e676" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1c2030" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${v}`} width={44} />
            <Tooltip content={<CustomTip />} />
            <ReferenceLine y={0} stroke="#252a38" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="pnl"      name="equity"   stroke="#00e676"
              strokeWidth={2} fill="url(#eqGrad)" dot={false}
              activeDot={{ r: 3, fill: '#00e676', strokeWidth: 0 }} />
            <Bar dataKey="drawdown" name="drawdown" fill="rgba(255,82,82,0.35)" radius={[1,1,0,0]} />
            <Legend iconType="square" iconSize={8}
              formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
