/**
 * App.jsx — Root component (v2: real-time edition)
 *
 * - Persistent layout: Sidebar + Header + main content
 * - Slide-in Notifications panel
 * - Global WebSocket initialisation for position token IDs
 * - Log stream starts/stops with agent status
 */

import React, { useEffect, useMemo } from 'react'
import useStore from './store/useStore'
import { usePolymarketWS } from './hooks/usePolymarketWS'

import Sidebar from './components/layout/Sidebar'
import Header  from './components/layout/Header'
import NotificationsPanel from './components/notifications/NotificationsPanel'

import Dashboard from './views/Dashboard'
import Markets   from './views/Markets'
import Positions from './views/Positions'
import Analytics from './views/Analytics'
import Logs      from './views/Logs'
import Settings  from './views/Settings'

const VIEWS = { dashboard: Dashboard, markets: Markets, positions: Positions, analytics: Analytics, logs: Logs, settings: Settings }

export default function App() {
  const activeView    = useStore((s) => s.activeView)
  const agentStatus   = useStore((s) => s.agentStatus)
  const positions     = useStore((s) => s.positions)
  const markets       = useStore((s) => s.markets)
  const startStream   = useStore((s) => s.startLogStream)
  const stopStream    = useStore((s) => s.stopLogStream)
  const notifOpen     = useStore((s) => s.notificationsPanelOpen)
  const checkAlerts   = useStore((s) => s.checkAlerts)

  // Subscribe to WebSocket for token IDs from positions AND visible markets.
  // Polymarket WS closes the connection if we don't subscribe to at least
  // one asset_id, so we need real IDs before the socket opens.
  const tokenIds = useMemo(() => {
    const ids = new Set()
    positions.forEach((p) => p.market_id && ids.add(p.market_id))
    markets.forEach((m) => {
      if (m.yesTokenId) ids.add(m.yesTokenId)
      if (m.noTokenId)  ids.add(m.noTokenId)
    })
    // Cap to a reasonable number to avoid massive subscribe frames
    return [...ids].slice(0, 50)
  }, [positions, markets])
  usePolymarketWS({ tokenIds })

  // Start/stop log streaming based on agent status
  useEffect(() => {
    if (agentStatus === 'active') startStream()
    else stopStream()
  }, [agentStatus, startStream, stopStream])

  // Check price alerts whenever store updates (runs on every render — lightweight)
  useEffect(() => {
    const interval = setInterval(checkAlerts, 5_000)
    return () => clearInterval(interval)
  }, [checkAlerts])

  const View = VIEWS[activeView] ?? Dashboard

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-0 text-white">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          <View />
        </main>
      </div>

      {/* Slide-in notifications panel */}
      {notifOpen && (
        <div className="absolute top-0 right-0 h-full z-50 shadow-2xl animate-slide_in">
          <NotificationsPanel />
        </div>
      )}
    </div>
  )
}
