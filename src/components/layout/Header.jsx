import React from 'react'
import { Bell, Wallet, Wifi, WifiOff, Radio } from 'lucide-react'
import useStore from '../../store/useStore'
import clsx from 'clsx'

const VIEW_LABELS = {
  dashboard: 'Overview Dashboard',
  markets:   'Live Market Browser',
  positions: 'Active Positions & Orders',
  analytics: 'Portfolio Analytics',
  logs:      'Execution History & Logs',
  settings:  'Agent Configuration',
}

export default function Header() {
  const activeView    = useStore((s) => s.activeView)
  const walletBalance = useStore((s) => s.walletBalance)
  const agentStatus   = useStore((s) => s.agentStatus)
  const toggleAgent   = useStore((s) => s.toggleAgentStatus)
  const wsStatus      = useStore((s) => s.wsStatus)
  const dataMode      = useStore((s) => s.dataMode)
  const notifications = useStore((s) => s.notifications)
  const togglePanel   = useStore((s) => s.toggleNotificationsPanel)

  const unread = notifications.filter((n) => !n.read).length

  // ── Data mode badge ──────────────────────────────────────────────────
  const DataModeBadge = () => {
    if (dataMode === 'loading') return null
    if (dataMode === 'live') {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono
                        text-neon-cyan border-cyan-800/50 bg-cyan-900/10">
          <Wifi size={10} />
          LIVE DATA
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono
                      text-warn border-yellow-700/50 bg-yellow-900/10"
           title="Polymarket APIs are unreachable. Prices are simulated.">
        <Radio size={10} className="animate-pulse" />
        DEMO MODE
      </div>
    )
  }

  // ── WS status chip ───────────────────────────────────────────────────
  const WsChip = () => {
    const cfg = {
      connected:    { label: 'WS LIVE',    cls: 'text-neon-green border-emerald-800/50 bg-emerald-900/10', icon: <Wifi size={9} /> },
      connecting:   { label: 'CONNECTING', cls: 'text-warn border-yellow-700/50',                          icon: <span className="animate-pulse">◌</span> },
      offline:      { label: 'WS OFFLINE', cls: 'text-slate-500 border-slate-700',                         icon: <WifiOff size={9} /> },
      disconnected: { label: 'RECONNECTING',cls: 'text-warn border-yellow-700/50',                         icon: <span className="animate-pulse">↻</span> },
      idle:         { label: 'WS IDLE',    cls: 'text-slate-500 border-slate-700',                         icon: null },
    }[wsStatus] ?? { label: wsStatus, cls: 'text-slate-500 border-slate-700', icon: null }

    return (
      <div className={clsx('hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-mono', cfg.cls)}>
        {cfg.icon}{cfg.label}
      </div>
    )
  }

  return (
    <header className="flex items-center justify-between px-5 h-11 shrink-0 border-b border-border bg-surface-1/70 backdrop-blur">
      {/* Left */}
      <div className="flex items-center gap-2.5">
        <h1 className="text-sm font-semibold text-white">{VIEW_LABELS[activeView]}</h1>
        <span className={clsx('text-[9px] font-mono px-1.5 py-0.5 rounded border',
          agentStatus === 'active'
            ? 'text-neon-green border-emerald-800/60 bg-emerald-900/20'
            : 'text-slate-400 border-slate-700 bg-slate-800/20')}>
          {agentStatus === 'active' ? '● LIVE' : '⏸ PAUSED'}
        </span>
        <DataModeBadge />
        <WsChip />
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Wallet */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-3 border border-border">
          <Wallet size={11} className="text-slate-400" />
          <span className="text-xs font-mono text-white">
            ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500">USDC</span>
        </div>

        {/* Notifications */}
        <button onClick={togglePanel} className="btn-ghost p-2 relative">
          <Bell size={13} />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-neon-green text-surface-0 text-[9px] font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Agent toggle */}
        <button
          onClick={toggleAgent}
          className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 border',
            agentStatus === 'active'
              ? 'bg-rose-600/15 border-rose-600/40 text-rose-400 hover:bg-rose-600/25'
              : 'bg-emerald-600/20 border-emerald-600/40 text-emerald-400 hover:bg-emerald-600/30'
          )}
        >
          {agentStatus === 'active' ? '⏸ Pause' : '▶ Resume'}
        </button>
      </div>
    </header>
  )
}
