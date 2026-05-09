import React from 'react'
import clsx from 'clsx'

/**
 * LimitOrdersPanel — displays pending limit orders with fill progress bars.
 *
 * Props:
 *   orders {Array} - Limit order objects from store
 */
export default function LimitOrdersPanel({ orders }) {
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Limit Orders</h2>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-3 border border-border text-slate-400">
          {orders.length} pending
        </span>
      </div>

      <div className="divide-y divide-border/30">
        {orders.map((order) => {
          const priceDelta = ((order.limit_price - order.current_price) / order.current_price) * 100
          const isClose    = Math.abs(priceDelta) < 5

          return (
            <div key={order.order_id} className="px-4 py-3 space-y-2">
              {/* Market + badge */}
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-white leading-snug">{order.question}</p>
                <span className={order.side === 'YES' ? 'badge-yes shrink-0' : 'badge-no shrink-0'}>
                  {order.side}
                </span>
              </div>

              {/* Price info */}
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="text-slate-500">
                  Limit <span className="text-slate-300">${order.limit_price.toFixed(3)}</span>
                </span>
                <span className="text-slate-500">
                  Current <span className={clsx(isClose ? 'text-warn' : 'text-slate-300')}>${order.current_price.toFixed(3)}</span>
                </span>
                <span className="text-slate-500">
                  Size <span className="text-slate-300">${order.size_usdc}</span>
                </span>
              </div>

              {/* Fill progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Fill Progress</span>
                  <span className={clsx('font-mono', order.fill_pct > 60 ? 'text-neon-green' : 'text-slate-400')}>
                    {order.fill_pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-4 overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      order.fill_pct > 60 ? 'bg-neon-green' : 'bg-slate-600'
                    )}
                    style={{ width: `${order.fill_pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
