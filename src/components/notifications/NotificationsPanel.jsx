/**
 * NotificationsPanel.jsx
 * Slide-in drawer from the right showing real-time notifications
 * and price alerts management.
 */

import React from 'react'
import clsx from 'clsx'
import { X, CheckCheck, Trash2, Bell, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'
import useStore from '../../store/useStore'

const LEVEL_CONFIG = {
  success: { icon: CheckCircle, cls: 'text-profit',   bg: 'bg-emerald-900/20 border-emerald-800/40' },
  warn:    { icon: AlertTriangle, cls: 'text-warn',   bg: 'bg-yellow-900/20  border-yellow-800/40' },
  error:   { icon: XCircle,     cls: 'text-loss',     bg: 'bg-rose-900/20    border-rose-800/40' },
  info:    { icon: Info,         cls: 'text-neon-cyan', bg: 'bg-cyan-900/20   border-cyan-800/40' },
}

const fmtTime = (iso) => {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 60_000)  return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function NotifItem({ notif }) {
  const cfg = LEVEL_CONFIG[notif.level] ?? LEVEL_CONFIG.info
  const Icon = cfg.icon
  return (
    <div className={clsx(
      'flex items-start gap-3 px-4 py-3 border-b border-border/40 transition-colors',
      notif.read ? 'opacity-50' : ''
    )}>
      <div className={clsx('flex items-center justify-center w-7 h-7 rounded-lg border shrink-0 mt-0.5', cfg.bg)}>
        <Icon size={13} className={cfg.cls} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-200 leading-snug">{notif.message}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{fmtTime(notif.timestamp)}</p>
      </div>
      {!notif.read && (
        <span className="w-1.5 h-1.5 rounded-full bg-neon-green shrink-0 mt-2" />
      )}
    </div>
  )
}

function AlertItem({ alert, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-200 truncate">{alert.marketQuestion}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
          {alert.direction === 'above' ? '↑ Above' : '↓ Below'} ${alert.targetPrice.toFixed(3)}
          {alert.triggered && <span className="ml-2 text-profit">● Triggered</span>}
        </p>
      </div>
      <button onClick={() => onRemove(alert.id)} className="btn-ghost p-1">
        <X size={12} />
      </button>
    </div>
  )
}

export default function NotificationsPanel() {
  const notifications    = useStore((s) => s.notifications)
  const alerts           = useStore((s) => s.alerts)
  const markAllRead      = useStore((s) => s.markAllRead)
  const clearNotifications = useStore((s) => s.clearNotifications)
  const removeAlert      = useStore((s) => s.removeAlert)
  const togglePanel      = useStore((s) => s.toggleNotificationsPanel)

  const [tab, setTab] = React.useState('notifications')
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="flex flex-col h-full w-80 bg-surface-2 border-l border-border shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-neon-green" />
          <span className="text-sm font-semibold text-white">Notifications</span>
          {unread > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-neon-green text-surface-0 font-bold">
              {unread}
            </span>
          )}
        </div>
        <button onClick={togglePanel} className="btn-ghost p-1.5">
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {['notifications', 'alerts'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'flex-1 py-2.5 text-xs font-medium capitalize transition-colors',
              tab === t ? 'text-white border-b-2 border-neon-green' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {t}
            {t === 'alerts' && alerts.length > 0 && (
              <span className="ml-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-surface-3 text-slate-400">
                {alerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Actions row */}
      {tab === 'notifications' && notifications.length > 0 && (
        <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-border">
          <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors">
            <CheckCheck size={11} /> Mark all read
          </button>
          <span className="text-slate-700">·</span>
          <button onClick={clearNotifications} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-loss transition-colors">
            <Trash2 size={11} /> Clear
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'notifications' ? (
          notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6">
              <Bell size={24} className="text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => <NotifItem key={n.id} notif={n} />)
          )
        ) : (
          alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6">
              <AlertTriangle size={24} className="text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">No alerts set</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Open a market in the Markets view and click &quot;Set Alert&quot;
              </p>
            </div>
          ) : (
            alerts.map((a) => (
              <AlertItem key={a.id} alert={a} onRemove={removeAlert} />
            ))
          )
        )}
      </div>
    </div>
  )
}
