/**
 * WinRateChart.jsx
 * Donut chart: PnL attribution by market category.
 */

import React, { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import useStore from '../../store/useStore'

const COLORS = ['#00e676', '#00e5ff', '#b388ff', '#ffab40', '#ff5252', '#f48fb1', '#80cbc4']

const CustomTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-surface-3 border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white font-medium mb-1">{d.category}</p>
      <p className="font-mono text-profit">+${d.profit.toFixed(2)} profit</p>
      <p className="font-mono text-loss">-${Math.abs(d.loss).toFixed(2)} loss</p>
      <p className="font-mono text-slate-400 mt-0.5">{d.winRate.toFixed(0)}% win rate</p>
    </div>
  )
}

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.07) return null
  const RADIAN = Math.PI / 180
  const r  = innerRadius + (outerRadius - innerRadius) * 0.5
  const x  = cx + r * Math.cos(-midAngle * RADIAN)
  const y  = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

export default function WinRateChart() {
  const trades = useStore((s) => s.tradeHistory)

  const data = useMemo(() => {
    const cats = {}
    for (const t of trades) {
      // Infer category from question keywords (since mock data doesn't have categories)
      let cat = 'Other'
      const q = t.question.toLowerCase()
      if (/btc|bitcoin|eth|crypto|blockchain|coin|token|defi/.test(q)) cat = 'Crypto'
      else if (/ai|gpt|openai|llm|model|anthropic/.test(q))           cat = 'AI'
      else if (/fed|rate|inflation|gdp|unemployment|market|s.p/.test(q)) cat = 'Economics'
      else if (/spacex|nasa|launch|starship/.test(q))                  cat = 'Science'
      else if (/election|president|party|vote|senator/.test(q))       cat = 'Politics'

      if (!cats[cat]) cats[cat] = { category: cat, profit: 0, loss: 0, wins: 0, total: 0 }
      cats[cat].total++
      if (t.realized_pnl > 0) { cats[cat].profit += t.realized_pnl; cats[cat].wins++ }
      else                     { cats[cat].loss += t.realized_pnl }
    }
    return Object.values(cats).map((c) => ({
      ...c,
      winRate: (c.wins / c.total) * 100,
      value: Math.abs(c.profit) + Math.abs(c.loss),
    }))
  }, [trades])

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">PnL by Category</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Volume allocation across market types</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              labelLine={false}
              label={renderLabel}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
