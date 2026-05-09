/**
 * Markets.jsx — Live Market Browser
 * Fetches from Gamma API, connects to WebSocket for live prices.
 * When APIs are unreachable (sandbox / restricted network) it automatically
 * falls back to 12 realistic mock markets with simulated prices.
 */

import React, { useState, useMemo } from 'react'
import { Search, RefreshCw, Radio, Wifi, Database } from 'lucide-react'
import clsx from 'clsx'
import useStore from '../store/useStore'
import { useMarkets } from '../hooks/useMarkets'
import { usePolymarketWS } from '../hooks/usePolymarketWS'
import MarketCard from '../components/market/MarketCard'
import MarketDetailPanel from '../components/market/MarketDetailPanel'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'

const CATEGORY_TAGS = [
  { label: 'All',        value: '' },
  { label: 'Crypto',     value: 'crypto' },
  { label: 'AI',         value: 'ai' },
  { label: 'Economics',  value: 'economics' },
  { label: 'Science',    value: 'science' },
  { label: 'Politics',   value: 'politics' },
  { label: 'Sports',     value: 'sports' },
]

export default function Markets() {
  const markets        = useStore((s) => s.markets)
  const marketsLoading = useStore((s) => s.marketsLoading)
  const marketsError   = useStore((s) => s.marketsError)
  const dataMode       = useStore((s) => s.dataMode)
  const wsStatus       = useStore((s) => s.wsStatus)
  const marketSearch   = useStore((s) => s.marketSearch)
  const marketCategory = useStore((s) => s.marketCategory)
  const marketSort     = useStore((s) => s.marketSort)
  const setMarketSearch   = useStore((s) => s.setMarketSearch)
  const setMarketCategory = useStore((s) => s.setMarketCategory)
  const setMarketSort     = useStore((s) => s.setMarketSort)
  const filteredMarkets   = useStore((s) => s.filteredMarkets)

  const [selectedMarket, setSelectedMarket] = useState(null)

  // Live fetch from Gamma API (auto-polls every 60s, falls back to mock)
  const { refetch } = useMarkets({ tag: marketCategory, order: marketSort, limit: 40, pollMs: 60_000 })

  // WebSocket: subscribe to YES/NO token IDs of all loaded markets
  const tokenIds = useMemo(
    () => markets.flatMap((m) => [m.yesTokenId, m.noTokenId]).filter(Boolean),
    [markets]
  )
  usePolymarketWS({ tokenIds })

  const visible = filteredMarkets()

  // ── Status banner ──────────────────────────────────────────────────────
  const StatusBanner = () => {
    if (dataMode === 'loading') return null
    if (dataMode === 'live') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-900/20 border border-cyan-800/40 text-[11px] text-neon-cyan">
          <Wifi size={11} />
          <span>
            <strong>Live data</strong> — {markets.length} markets from Polymarket API ·{' '}
            {wsStatus === 'connected' ? 'prices streaming via WebSocket' : `prices ${wsStatus}`}
          </span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-900/15 border border-yellow-700/40 text-[11px] text-warn">
        <Radio size={11} className="animate-pulse shrink-0" />
        <span>
          <strong>Demo mode</strong> — Polymarket API unreachable ({marketsError?.slice(0, 60)}).
          Showing {markets.length} simulated markets with price animation.
          {' '}<span className="underline cursor-pointer" onClick={refetch}>Retry now</span>
        </span>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: market grid */}
      <div className={clsx('flex flex-col h-full overflow-hidden transition-all duration-300',
        selectedMarket ? 'w-[55%]' : 'w-full'
      )}>

        {/* Toolbar */}
        <div className="px-6 pt-4 pb-3 space-y-2.5 shrink-0">
          {/* Status banner */}
          <StatusBanner />

          {/* Search + sort + refresh */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2 border border-border">
              <Search size={13} className="text-slate-500 shrink-0" />
              <input
                value={marketSearch}
                onChange={(e) => setMarketSearch(e.target.value)}
                placeholder="Search markets…"
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              {marketSearch && (
                <button onClick={() => setMarketSearch('')} className="text-slate-500 hover:text-white text-xs">✕</button>
              )}
            </div>
            <select
              value={marketSort}
              onChange={(e) => setMarketSort(e.target.value)}
              className="input-field py-1.5 text-xs w-36 shrink-0"
            >
              <option value="volume24hr">24h Volume</option>
              <option value="liquidity">Liquidity</option>
              <option value="startDate">Newest</option>
            </select>
            <button
              onClick={refetch}
              className="btn-ghost p-2 shrink-0"
              title="Refresh markets"
              disabled={marketsLoading}
            >
              <RefreshCw size={14} className={marketsLoading ? 'animate-spin text-neon-green' : ''} />
            </button>
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {CATEGORY_TAGS.map((t) => (
              <button
                key={t.value}
                onClick={() => setMarketCategory(t.value)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0',
                  marketCategory === t.value
                    ? 'bg-emerald-600/25 border-emerald-700/60 text-neon-green'
                    : 'bg-surface-2 border-border text-slate-400 hover:text-white'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {visible.length} {visible.length === 1 ? 'market' : 'markets'}
              {marketSearch ? ` matching "${marketSearch}"` : ''}
            </span>
            {dataMode === 'demo' && (
              <span className="flex items-center gap-1 text-slate-500">
                <Database size={10} /> Mock data · prices updating every 2.5s
              </span>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {marketsLoading && markets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Spinner size={28} className="text-neon-green" />
              <p className="text-sm text-slate-500">Fetching markets…</p>
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No markets match your filter"
              subtitle={`Try clearing the search${marketCategory ? ' or selecting a different category' : ''}.`}
              action={
                <button onClick={() => { setMarketSearch(''); setMarketCategory('') }}
                  className="btn-ghost text-xs">
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className={clsx(
              'grid gap-3',
              selectedMarket
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
            )}>
              {visible.map((m) => (
                <MarketCard
                  key={m.id}
                  market={m}
                  onSelect={(market) =>
                    setSelectedMarket((prev) => prev?.id === market.id ? null : market)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: detail panel */}
      {selectedMarket && (
        <div className="w-[45%] shrink-0 h-full overflow-hidden border-l border-border">
          <MarketDetailPanel
            market={selectedMarket}
            onClose={() => setSelectedMarket(null)}
          />
        </div>
      )}
    </div>
  )
}
