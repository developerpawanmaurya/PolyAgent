import React from 'react'
import { DollarSign, TrendingUp, BarChart2, Target } from 'lucide-react'
import useStore from '../store/useStore'
import KPICard from '../components/dashboard/KPICard'
import PnLChart from '../components/dashboard/PnLChart'
import AgentToggle from '../components/dashboard/AgentToggle'
import SignalFeed from '../components/dashboard/SignalFeed'
import LiveTicker from '../components/dashboard/LiveTicker'

export default function Dashboard() {
  const totalPnl      = useStore((s) => s.totalPnl)
  const pnl24h        = useStore((s) => s.pnl24h)
  const walletBalance = useStore((s) => s.walletBalance)
  const volume24h     = useStore((s) => s.volume24h)
  const winLoss       = useStore((s) => s.winLoss)
  const positions     = useStore((s) => s.positions)
  const livePrices    = useStore((s) => s.livePrices)

  const winRate = ((winLoss.wins / (winLoss.wins + winLoss.losses)) * 100).toFixed(1)

  // Unrealized PnL using live prices where available
  const unrealizedPnl = positions.reduce((sum, p) => {
    const price = livePrices[p.market_id] ?? p.current_price
    return sum + (price - p.avg_price) * p.shares
  }, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Live ticker at top */}
      <LiveTicker />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total PnL"
            value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`}
            subValue={`${pnl24h >= 0 ? '+' : ''}$${pnl24h.toFixed(2)} today`}
            trend={pnl24h >= 0 ? 'up' : 'down'}
            icon={<DollarSign size={15} />}
            accent="green"
          />
          <KPICard
            title="Wallet Balance"
            value={`$${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            subValue="USDC"
            icon={<TrendingUp size={15} />}
            accent="cyan"
          />
          <KPICard
            title="Unrealized PnL"
            value={`${unrealizedPnl >= 0 ? '+' : ''}$${unrealizedPnl.toFixed(2)}`}
            subValue="Open positions"
            trend={unrealizedPnl >= 0 ? 'up' : 'down'}
            icon={<BarChart2 size={15} />}
            accent={unrealizedPnl >= 0 ? 'green' : 'purple'}
          />
          <KPICard
            title="Win / Loss Ratio"
            value={`${winRate}%`}
            subValue={`${winLoss.wins}W / ${winLoss.losses}L`}
            trend={parseFloat(winRate) >= 60 ? 'up' : 'down'}
            icon={<Target size={15} />}
            accent="green"
          />
        </div>

        {/* Chart + Agent toggle + Signal feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <PnLChart />
          </div>
          <div className="lg:col-span-2">
            <AgentToggle />
          </div>
          <div className="lg:col-span-3">
            <SignalFeed />
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Open Positions',  value: positions.length },
            { label: 'Pending Orders',  value: '2' },
            { label: '24h Volume',      value: `$${volume24h.toFixed(0)}` },
            { label: 'Markets Scanned', value: '2,400+' },
          ].map(({ label, value }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-lg font-semibold font-mono text-white">{value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
