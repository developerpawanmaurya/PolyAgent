import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import useStore from '../../store/useStore'
import clsx from 'clsx'

const RANGES = ['24h', '7d', '30d']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const value = payload[0].value
  return (
    <div className="bg-surface-3 border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className={clsx('font-mono font-semibold', value >= 0 ? 'text-profit' : 'text-loss')}>
        {value >= 0 ? '+' : ''}${value.toFixed(2)} USDC
      </p>
    </div>
  )
}

export default function PnLChart() {
  const chartRange      = useStore((s) => s.chartRange)
  const setChartRange   = useStore((s) => s.setChartRange)
  const filteredSeries  = useStore((s) => s.filteredPnlSeries())

  const latestPnl = filteredSeries[filteredSeries.length - 1]?.pnl ?? 0
  const isPositive = latestPnl >= 0

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">PnL Over Time</p>
          <p className={clsx('text-xl font-semibold font-mono mt-0.5', isPositive ? 'text-profit' : 'text-loss')}>
            {isPositive ? '+' : ''}${latestPnl.toFixed(2)} USDC
          </p>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-3 border border-border">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setChartRange(r)}
              className={clsx(
                'px-3 py-1 rounded-md text-xs font-medium transition-all duration-150',
                chartRange === r
                  ? 'bg-emerald-600/30 text-neon-green border border-emerald-700/50'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredSeries} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#00e676" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#00e676" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pnlGradNeg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#ff5252" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#ff5252" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1c2030" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              width={48}
            />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine y={0} stroke="#252a38" strokeDasharray="4 4" />

            <Area
              type="monotone"
              dataKey="pnl"
              stroke={isPositive ? '#00e676' : '#ff5252'}
              strokeWidth={2}
              fill={isPositive ? 'url(#pnlGrad)' : 'url(#pnlGradNeg)'}
              dot={false}
              activeDot={{ r: 4, fill: isPositive ? '#00e676' : '#ff5252', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
