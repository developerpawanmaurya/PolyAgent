import React from 'react'
import {
  LayoutDashboard, TrendingUp, ScrollText, Settings,
  Zap, ExternalLink, Globe, BarChart3,
} from 'lucide-react'
import useStore from '../../store/useStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview',   icon: LayoutDashboard },
  { id: 'markets',   label: 'Markets',    icon: Globe },
  { id: 'positions', label: 'Positions',  icon: TrendingUp },
  { id: 'analytics', label: 'Analytics',  icon: BarChart3 },
  { id: 'logs',      label: 'Exec Logs',  icon: ScrollText },
  { id: 'settings',  label: 'Settings',   icon: Settings },
]

export default function Sidebar() {
  const activeView    = useStore((s) => s.activeView)
  const setActiveView = useStore((s) => s.setActiveView)
  const agentStatus   = useStore((s) => s.agentStatus)
  const wsStatus      = useStore((s) => s.wsStatus)
  const walletBalance = useStore((s) => s.walletBalance)
  const totalPnl      = useStore((s) => s.totalPnl)

  return (
    <aside className="flex flex-col w-60 shrink-0 h-full bg-surface-1 border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-600/40">
          <Zap size={16} className="text-neon-green" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">PolyAgent</p>
          <p className="text-[10px] text-slate-500 mt-0.5">AI Trading Dashboard</p>
        </div>
      </div>

      {/* Agent + WS status */}
      <div className="mx-4 mt-4 mb-1 px-3 py-2.5 rounded-lg bg-surface-3 border border-border space-y-2">
        <div className="flex items-center gap-2">
          <span className={clsx('w-2 h-2 rounded-full shrink-0', agentStatus === 'active' ? 'bg-neon-green animate-pulse_dot' : 'bg-slate-500')} />
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 leading-none">Agent</p>
            <p className={clsx('text-xs font-semibold font-mono capitalize', agentStatus === 'active' ? 'text-neon-green' : 'text-slate-400')}>
              {agentStatus}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx('w-2 h-2 rounded-full shrink-0',
            wsStatus === 'connected'   ? 'bg-neon-cyan animate-pulse_dot'
            : wsStatus === 'connecting' || wsStatus === 'disconnected' ? 'bg-warn animate-pulse_dot'
            : 'bg-slate-600'
          )} />
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 leading-none">Price Feed</p>
            <p className={clsx('text-xs font-semibold font-mono capitalize',
              wsStatus === 'connected'    ? 'text-neon-cyan'
              : wsStatus === 'offline'   ? 'text-slate-500'
              : wsStatus === 'connecting' || wsStatus === 'disconnected' ? 'text-warn'
              : 'text-slate-500')}>
              {wsStatus === 'offline' ? 'simulated' : wsStatus}
            </p>
          </div>
        </div>
      </div>

      {/* Wallet snapshot */}
      <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-surface-2 border border-border/60">
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-500">Balance</span>
          <span className="font-mono text-slate-300">${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-[10px] mt-0.5">
          <span className="text-slate-500">Total PnL</span>
          <span className={clsx('font-mono font-semibold', totalPnl >= 0 ? 'text-profit' : 'text-loss')}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-1 pb-1 text-[10px] font-medium uppercase tracking-widest text-slate-600">Navigation</p>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={clsx('nav-item w-full text-left', activeView === id && 'active')}
          >
            <Icon size={15} className="shrink-0" />
            {label}
            {id === 'markets' && wsStatus === 'connected' && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border space-y-2">
        <a
          href="https://github.com/Polymarket/agents"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ExternalLink size={11} /> polymarket/agents
        </a>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-600">v2.0.0</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-slate-500 font-mono">White-label ready</span>
        </div>
      </div>
    </aside>
  )
}
