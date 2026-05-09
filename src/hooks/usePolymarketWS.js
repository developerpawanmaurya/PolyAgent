/**
 * usePolymarketWS.js  (v2 — with offline simulation fallback)
 * ─────────────────────────────────────────────────────────────────────────
 * Opens a persistent WebSocket to the Polymarket CLOB market channel.
 *
 * Endpoint: wss://ws-subscriptions-clob.polymarket.com/ws/market
 *
 * When the WebSocket cannot connect (network blocked, sandbox, etc.):
 *   → Status is set to 'offline'
 *   → A setInterval timer starts nudging mock prices so the UI still
 *     shows believable live-looking price movement.
 *   → When a real connection eventually succeeds, the simulation stops.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useCallback } from 'react'
import useStore from '../store/useStore'

// In dev, route through Vite's proxy (defined in vite.config.js) to dodge
// origin/CORS-style blocks that some networks/extensions impose on direct
// wss:// connections. In production, hit Polymarket directly.
const WS_URL = import.meta.env.DEV
  ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws-polymarket/ws/market`
  : 'wss://ws-subscriptions-clob.polymarket.com/ws/market'
const MAX_BACKOFF_MS  = 30_000
const INIT_BACKOFF_MS = 1_500
// Give the socket this long to connect before we declare it offline
const CONNECT_TIMEOUT_MS = 6_000
// How often to nudge simulated prices when offline (ms)
const SIM_INTERVAL_MS = 2_500

// ── Singleton state ──────────────────────────────────────────────────────────
let _socket         = null
let _subscribers    = new Set()
let _backoff        = INIT_BACKOFF_MS
let _reconnectTimer = null
let _connectTimer   = null   // fires if WS doesn't open within CONNECT_TIMEOUT_MS
let _simTimer       = null   // price simulation when offline
let _intentionalClose = false
let _isSimulating   = false

// ── Helpers ──────────────────────────────────────────────────────────────────
function sendSubscribe(ids) {
  if (!_socket || _socket.readyState !== WebSocket.OPEN || !ids.length) return
  _socket.send(JSON.stringify({ type: 'subscribe', channel: 'market', assets_ids: ids }))
}

function sendUnsubscribe(ids) {
  if (!_socket || _socket.readyState !== WebSocket.OPEN || !ids.length) return
  _socket.send(JSON.stringify({ type: 'unsubscribe', channel: 'market', assets_ids: ids }))
}

function startSimulation(tokenIds, setLivePrice) {
  if (_isSimulating || !tokenIds.length) return
  _isSimulating = true

  // Seed initial prices for each token from a deterministic hash
  const seeds = {}
  for (const id of tokenIds) {
    const hash = parseInt(id.slice(-6), 16)
    seeds[id] = 0.25 + (hash % 1000) / 2000 // 0.25 – 0.75
  }

  _simTimer = setInterval(() => {
    for (const id of tokenIds) {
      if (!seeds[id]) seeds[id] = 0.5
      // Random walk ±0.5% per tick
      seeds[id] = Math.max(0.02, Math.min(0.97, seeds[id] + (Math.random() - 0.5) * 0.01))
      setLivePrice(id, parseFloat(seeds[id].toFixed(4)))
    }
  }, SIM_INTERVAL_MS)
}

function stopSimulation() {
  if (_simTimer) { clearInterval(_simTimer); _simTimer = null }
  _isSimulating = false
}

// ── Socket management ─────────────────────────────────────────────────────────
function openSocket({ onMessage, onStatus, tokenIds, setLivePrice }) {
  if (_socket && _socket.readyState <= WebSocket.OPEN) return
  if (_intentionalClose) return

  // Polymarket closes the socket if we don't subscribe to at least one
  // asset_id within a few seconds. Don't even attempt to connect until
  // we have something to subscribe to — run the simulator instead.
  const initialIds = [...new Set([..._subscribers, ...(tokenIds || [])])].filter(Boolean)
  if (initialIds.length === 0) {
    onStatus('offline')
    startSimulation(tokenIds || [], setLivePrice)
    return
  }

  onStatus('connecting')

  // Start connect-timeout: if WS doesn't open in time, switch to simulation
  if (_connectTimer) clearTimeout(_connectTimer)
  _connectTimer = setTimeout(() => {
    if (_socket && _socket.readyState !== WebSocket.OPEN) {
      onStatus('offline')
      startSimulation([...(_subscribers.size ? _subscribers : new Set(tokenIds))], setLivePrice)
    }
  }, CONNECT_TIMEOUT_MS)

  try {
    _socket = new WebSocket(WS_URL)
  } catch {
    // WebSocket constructor can throw in restricted environments
    clearTimeout(_connectTimer)
    onStatus('offline')
    startSimulation(tokenIds, setLivePrice)
    return
  }

  _socket.onopen = () => {
    clearTimeout(_connectTimer)
    _backoff = INIT_BACKOFF_MS
    stopSimulation()
    onStatus('connected')
    // Make sure all known IDs are tracked, then subscribe to them.
    initialIds.forEach((id) => _subscribers.add(id))
    sendSubscribe([..._subscribers])
  }

  _socket.onmessage = (ev) => {
    try {
      const msgs = JSON.parse(ev.data)
      const arr  = Array.isArray(msgs) ? msgs : [msgs]
      arr.forEach(onMessage)
    } catch { /* ignore malformed frames */ }
  }

  _socket.onerror = () => { /* onclose handles reconnect */ }

  _socket.onclose = () => {
    clearTimeout(_connectTimer)
    _socket = null
    onStatus('disconnected')
    if (_intentionalClose) return
    // Back-off reconnect
    _reconnectTimer = setTimeout(() => {
      _backoff = Math.min(_backoff * 2, MAX_BACKOFF_MS)
      openSocket({ onMessage, onStatus, tokenIds, setLivePrice })
    }, _backoff)
    // Start simulation while reconnecting
    startSimulation([..._subscribers], setLivePrice)
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function usePolymarketWS({ tokenIds = [] } = {}) {
  const setLivePrice    = useStore((s) => s.setLivePrice)
  const setWsStatus     = useStore((s) => s.setWsStatus)
  const addNotification = useStore((s) => s.addNotification)

  const prevTokens   = useRef([])
  const mountedRef   = useRef(true)
  const tokenIdsRef  = useRef(tokenIds)
  tokenIdsRef.current = tokenIds

  const handleMessage = useCallback((msg) => {
    if (!mountedRef.current) return
    switch (msg.event_type) {
      case 'price_change':
      case 'last_trade_price':
        if (msg.asset_id && msg.price) setLivePrice(msg.asset_id, parseFloat(msg.price))
        break
      case 'book':
        if (msg.asset_id && msg.bids?.length && msg.asks?.length) {
          const mid = (parseFloat(msg.bids[0]?.price ?? 0) + parseFloat(msg.asks[0]?.price ?? 0)) / 2
          if (mid > 0) setLivePrice(msg.asset_id, mid)
        }
        break
      default: break
    }
  }, [setLivePrice])

  const handleStatus = useCallback((status) => {
    if (!mountedRef.current) return
    setWsStatus(status)
    if (status === 'connected') {
      addNotification({ level: 'success', message: '🟢 Live price feed connected via WebSocket.' })
    } else if (status === 'offline') {
      addNotification({ level: 'warn', message: '📡 Live feed offline — prices simulated from mock data.' })
    } else if (status === 'disconnected') {
      addNotification({ level: 'warn', message: '⚠ Feed disconnected — reconnecting…' })
    }
  }, [setWsStatus, addNotification])

  useEffect(() => {
    mountedRef.current  = true
    _intentionalClose   = false

    openSocket({
      onMessage:   handleMessage,
      onStatus:    handleStatus,
      tokenIds:    tokenIdsRef.current,
      setLivePrice,
    })

    return () => {
      mountedRef.current = false
    }
  }, [handleMessage, handleStatus, setLivePrice])

  // Diff-subscribe: only send subscribe/unsubscribe for changed tokens
  useEffect(() => {
    const prev = new Set(prevTokens.current)
    const next = new Set(tokenIds)

    const toAdd    = tokenIds.filter((t) => !prev.has(t))
    const toRemove = prevTokens.current.filter((t) => !next.has(t))

    toAdd.forEach((t) => _subscribers.add(t))
    toRemove.forEach((t) => _subscribers.delete(t))

    if (_socket?.readyState === WebSocket.OPEN) {
      if (toAdd.length)    sendSubscribe(toAdd)
      if (toRemove.length) sendUnsubscribe(toRemove)
    } else if (_subscribers.size > 0 && !_socket) {
      // We deferred connecting because there were no tokens at mount.
      // Now that we have some, open the socket.
      openSocket({
        onMessage: handleMessage,
        onStatus:  handleStatus,
        tokenIds,
        setLivePrice,
      })
    }

    prevTokens.current = tokenIds
  }, [tokenIds, handleMessage, handleStatus, setLivePrice])

  return null
}

export function closePolymarketWS() {
  _intentionalClose = true
  if (_connectTimer)   clearTimeout(_connectTimer)
  if (_reconnectTimer) clearTimeout(_reconnectTimer)
  stopSimulation()
  _socket?.close()
  _socket = null
  _subscribers.clear()
}
