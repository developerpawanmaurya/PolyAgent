# Polymarket AI Agent — GUI Dashboard v2

A professional, dark-mode, Web3-native React dashboard for the
[`polymarket/agents`](https://github.com/Polymarket/agents) Python framework.
**Real-time data from Polymarket's public APIs. No API key required.**

## Quick Start

```bash
cd polymarket-dashboard
npm install
npm run dev
# → http://localhost:5173
```

## What's Live

| Feature                  | Source                                      |
|--------------------------|---------------------------------------------|
| Market Browser           | Gamma API · `gamma-api.polymarket.com`      |
| Live YES/NO prices       | WebSocket · `ws-subscriptions-clob.poly…`  |
| Order book (bid/ask)     | CLOB API · `clob.polymarket.com/book`       |
| Price history chart      | CLOB API · `clob.polymarket.com/prices-history` |
| Portfolio analytics      | Derived from mock position data             |
| Agent logs + signals     | Simulated (ready for FastAPI bridge)        |

## Views

| View        | Description                                                    |
|-------------|----------------------------------------------------------------|
| Overview    | KPIs, PnL chart, live unrealized PnL, AI signal feed, ticker  |
| Markets     | Browse 40+ live Polymarket markets with search/filter/sort     |
| Positions   | Active positions with live P&L, limit order fill bars          |
| Analytics   | Equity curve, Sharpe, drawdown, win-rate donut by category     |
| Exec Logs   | Trade history + auto-scrolling terminal with streaming logs    |
| Settings    | Agent parameters with form validation                          |

## Tech Stack

| Layer        | Library                  |
|--------------|--------------------------|
| Framework    | React 18 + Vite 5        |
| Styling      | Tailwind CSS 3           |
| Charts       | Recharts                 |
| State        | Zustand                  |
| Icons        | Lucide React             |
| Live data    | Browser WebSocket API    |

## Architecture

```
src/
├── services/polymarketApi.js   ← Gamma + CLOB REST wrappers
├── hooks/
│   ├── usePolymarketWS.js      ← WebSocket (auto-reconnect, diff-subscribe)
│   └── useMarkets.js           ← Data hooks for markets, order book, price history
├── store/useStore.js           ← Zustand (markets, livePrices, alerts, notifications…)
├── components/
│   ├── layout/                 ← Sidebar (WS status), Header (alert bell)
│   ├── dashboard/              ← KPICard, PnLChart, LiveTicker, SignalFeed, AgentToggle
│   ├── market/                 ← MarketCard, MarketDetailPanel, OrderBookViz
│   ├── analytics/              ← EquityCurve, WinRateChart, PerformanceMetrics
│   ├── notifications/          ← NotificationsPanel (alerts + notifications drawer)
│   ├── positions/              ← PositionsTable, LimitOrdersPanel
│   ├── logs/                   ← TradeHistory, TerminalLog
│   ├── settings/               ← SettingsForm
│   └── common/                 ← Spinner, EmptyState
└── views/                      ← Dashboard, Markets, Positions, Analytics, Logs, Settings
```

## Connecting to the Python Backend

Replace mock data imports in `useStore.js` with `fetch()` calls to your FastAPI server:

```js
// In useMarkets.js or direct in the store action:
const res  = await fetch('http://localhost:8000/api/agent/state')
const data = await res.json()
// Then call setMarkets(data.markets), etc.
```

Recommended FastAPI endpoints:
- `GET /api/agent/state`  — agent status, wallet, PnL, positions
- `GET /api/logs`         — last N log lines
- `POST /api/settings`    — update agent config

## White-Labeling

All brand colors live in `tailwind.config.js` → `theme.extend.colors.neon.*`.
Swap those five hex values and the entire UI re-themes instantly.
