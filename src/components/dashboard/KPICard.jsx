import React from 'react'
import clsx from 'clsx'
import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * KPICard — displays a single metric with optional trend indicator.
 *
 * Props:
 *   title      {string}  - Label text
 *   value      {string}  - Primary display value
 *   subValue   {string}  - Secondary / change value
 *   trend      {'up'|'down'|null} - Trend direction
 *   icon       {ReactNode}
 *   accent     {'green'|'cyan'|'purple'|'neutral'}
 */
export default function KPICard({ title, value, subValue, trend, icon, accent = 'neutral' }) {
  const accentMap = {
    green:   'border-emerald-700/40 shadow-neon',
    cyan:    'border-cyan-700/40 shadow-neon-cyan',
    purple:  'border-purple-700/40',
    neutral: 'border-border',
  }

  const iconBgMap = {
    green:   'bg-emerald-900/40 text-neon-green',
    cyan:    'bg-cyan-900/40 text-neon-cyan',
    purple:  'bg-purple-900/40 text-neon-purple',
    neutral: 'bg-surface-4 text-slate-400',
  }

  return (
    <div className={clsx('card p-5 flex flex-col gap-3 border', accentMap[accent])}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        {icon && (
          <div className={clsx('flex items-center justify-center w-8 h-8 rounded-lg', iconBgMap[accent])}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-semibold text-white tracking-tight font-mono">{value}</p>
        {subValue && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' && <TrendingUp size={12} className="text-profit" />}
            {trend === 'down' && <TrendingDown size={12} className="text-loss" />}
            <span
              className={clsx(
                'text-xs font-mono',
                trend === 'up'   && 'text-profit',
                trend === 'down' && 'text-loss',
                !trend            && 'text-slate-500'
              )}
            >
              {subValue}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
