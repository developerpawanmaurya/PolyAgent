/**
 * useStore.js  — Zustand global store (v2: real-time edition)
 * ─────────────────────────────────────────────────────────────
 * Adds: markets, livePrices, orderBook, priceHistory,
 *       alerts, notifications, wsStatus, selectedMarket
 */

import { create } from 'zustand'
import {
  initialAgentState,
  activePositions,
  limitOrders,
  tradeHistory,
  initialLogs,
  streamingLogMessages,
  defaultSettings,
  pnlSeries,
} from '../data/mockData'

let logIdCounter = initialLogs.length + 1
let logStreamInterval = null
let notifIdCounter = 1

const useStore = create((set, get) => ({

  // ── Navigation ────────────────────────────────────────────────────────
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),

  // ── Agent State ───────────────────────────────────────────────────────
  agentStatus:    initialAgentState.agent_status,
  walletBalance:  initialAgentState.wallet_balance,
  totalPnl:       initialAgentState.total_pnl,
  pnl24h:         initialAgentState.pnl_24h,
  volume24h:      initialAgentState.volume_24h,
  winLoss:        initialAgentState.win_loss,

  toggleAgentStatus: () =>
    set((s) => ({ agentStatus: s.agentStatus === 'active' ? 'paused' : 'active' })),

  // ── PnL Chart ─────────────────────────────────────────────────────────
  pnlSeries,
  chartRange: '30d',
  setChartRange: (range) => set({ chartRange: range }),
  filteredPnlSeries: () => {
    const { pnlSeries, chartRange } = get()
    const days = chartRange === '24h' ? 1 : chartRange === '7d' ? 7 : 30
    return pnlSeries.slice(-Math.max(days, 1))
  },

  // ── Positions ─────────────────────────────────────────────────────────
  positions:   activePositions,
  limitOrders,

  // ── Trade History ─────────────────────────────────────────────────────
  tradeHistory,

  // ── Logs ──────────────────────────────────────────────────────────────
  logs: initialLogs,
  logFilter: 'ALL',   // 'ALL' | 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR'

  setLogFilter: (f) => set({ logFilter: f }),

  appendLog: (entry) =>
    set((s) => ({
      logs: [
        ...s.logs.slice(-499),
        { id: logIdCounter++, timestamp: new Date().toISOString(), ...entry },
      ],
    })),

  startLogStream: () => {
    if (logStreamInterval) return
    let idx = 0
    logStreamInterval = setInterval(() => {
      const { agentStatus, appendLog } = get()
      if (agentStatus !== 'active') return
      appendLog(streamingLogMessages[idx % streamingLogMessages.length])
      idx++
    }, 3_500)
  },

  stopLogStream: () => {
    clearInterval(logStreamInterval)
    logStreamInterval = null
  },

  // ── Settings ──────────────────────────────────────────────────────────
  settings:     defaultSettings,
  settingsSaved: false,
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch }, settingsSaved: false })),
  saveSettings: () => set({ settingsSaved: true }),

  // ── Data mode ─────────────────────────────────────────────────────────
  // 'loading' | 'live' | 'demo'
  // 'live'  = successfully fetched from Polymarket APIs
  // 'demo'  = APIs unreachable, running on mock/simulated data
  dataMode: 'loading',
  setDataMode: (mode) => set({ dataMode: mode }),

  // ── Live Markets (from Gamma API) ─────────────────────────────────────
  markets:         [],
  marketsLoading:  false,
  marketsError:    null,
  selectedMarket:  null,

  setMarkets:        (markets)  => set({ markets }),
  setMarketsLoading: (v)        => set({ marketsLoading: v }),
  setMarketsError:   (e)        => set({ marketsError: e }),
  setSelectedMarket: (market)   => set({ selectedMarket: market }),

  // ── Live Prices (from WebSocket) ──────────────────────────────────────
  // { [tokenId]: price }
  livePrices: {},
  setLivePrice: (tokenId, price) =>
    set((s) => ({ livePrices: { ...s.livePrices, [tokenId]: price } })),

  // Convenience: get live price or fall back to market's outcomePrices
  getLiveYesPrice: (market) => {
    if (!market) return null
    const { livePrices } = get()
    return livePrices[market.yesTokenId] ?? market.yesPrice
  },

  // ── WebSocket Status ──────────────────────────────────────────────────
  wsStatus: 'idle',   // 'idle' | 'connecting' | 'connected' | 'disconnected'
  setWsStatus: (status) => set({ wsStatus: status }),

  // ── Order Book ────────────────────────────────────────────────────────
  orderBook:        null,
  orderBookTokenId: null,
  setOrderBook: (book) => set({ orderBook: book }),
  setOrderBookTokenId: (id) => set({ orderBookTokenId: id, orderBook: null }),

  // ── Price History (for selected market chart) ─────────────────────────
  priceHistory:        [],
  priceHistoryLoading: false,
  setPriceHistory:        (h) => set({ priceHistory: h }),
  setPriceHistoryLoading: (v) => set({ priceHistoryLoading: v }),

  // ── Alerts ────────────────────────────────────────────────────────────
  // { id, marketQuestion, tokenId, targetPrice, direction: 'above'|'below', triggered }
  alerts: [],

  addAlert: (alert) =>
    set((s) => ({
      alerts: [...s.alerts, { id: Date.now(), triggered: false, ...alert }],
    })),

  removeAlert: (id) =>
    set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

  checkAlerts: () => {
    const { alerts, livePrices, addNotification } = get()
    const updated = alerts.map((alert) => {
      if (alert.triggered) return alert
      const price = livePrices[alert.tokenId]
      if (!price) return alert
      const hit =
        (alert.direction === 'above' && price >= alert.targetPrice) ||
        (alert.direction === 'below' && price <= alert.targetPrice)
      if (hit) {
        addNotification({
          level: 'success',
          message: `🎯 Alert: "${alert.marketQuestion}" ${alert.direction} $${alert.targetPrice.toFixed(3)} — now $${price.toFixed(3)}`,
        })
        return { ...alert, triggered: true }
      }
      return alert
    })
    set({ alerts: updated })
  },

  // ── Notifications ─────────────────────────────────────────────────────
  // { id, level: 'info'|'success'|'warn'|'error', message, timestamp, read }
  notifications: [],
  notificationsPanelOpen: false,

  addNotification: (notif) =>
    set((s) => ({
      notifications: [
        {
          id: notifIdCounter++,
          timestamp: new Date().toISOString(),
          read: false,
          level: 'info',
          ...notif,
        },
        ...s.notifications.slice(0, 99),
      ],
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearNotifications: () => set({ notifications: [] }),

  toggleNotificationsPanel: () =>
    set((s) => ({ notificationsPanelOpen: !s.notificationsPanelOpen })),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  // ── Market Category Filter (for browser) ─────────────────────────────
  marketCategory: '',
  marketSearch:   '',
  marketSort:     'volume24hr',

  setMarketCategory: (c) => set({ marketCategory: c }),
  setMarketSearch:   (q) => set({ marketSearch: q }),
  setMarketSort:     (s) => set({ marketSort: s }),

  filteredMarkets: () => {
    const { markets, marketCategory, marketSearch, marketSort } = get()
    let result = [...markets]
    if (marketCategory) {
      result = result.filter((m) =>
        m.tags?.some((t) => t.slug === marketCategory || t.label === marketCategory) ||
        m.category === marketCategory
      )
    }
    if (marketSearch) {
      const q = marketSearch.toLowerCase()
      result = result.filter((m) => m.question?.toLowerCase().includes(q))
    }
    result.sort((a, b) =>
      marketSort === 'liquidity'
        ? b.liquidity - a.liquidity
        : b.volume24h - a.volume24h
    )
    return result
  },
}))

export default useStore
