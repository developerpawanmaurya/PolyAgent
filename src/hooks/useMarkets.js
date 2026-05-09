/**
 * useMarkets.js
 * Custom hooks that fetch data from Polymarket APIs and populate the store.
 * If any fetch fails (network blocked, CORS, timeout), the hook falls back
 * to realistic mock data so the UI always remains functional.
 */

import { useEffect, useCallback, useRef } from 'react'
import { fetchMarkets, normaliseMarket, fetchOrderBook, fetchPriceHistory } from '../services/polymarketApi'
import { mockMarkets } from '../data/mockData'
import useStore from '../store/useStore'

// ── useMarkets ───────────────────────────────────────────────────────────────
/**
 * @param {object} opts
 * @param {string}  opts.tag     - Category tag filter (empty = all)
 * @param {string}  opts.order   - Sort: 'volume24hr' | 'liquidity'
 * @param {number}  opts.limit
 * @param {number}  opts.pollMs  - Auto-refresh interval in ms (0 = disabled)
 */
export function useMarkets({ tag = '', order = 'volume24hr', limit = 30, pollMs = 60_000 } = {}) {
  const setMarkets        = useStore((s) => s.setMarkets)
  const setMarketsLoading = useStore((s) => s.setMarketsLoading)
  const setMarketsError   = useStore((s) => s.setMarketsError)
  const setDataMode       = useStore((s) => s.setDataMode)
  const intervalRef       = useRef(null)
  const hasFetchedRef     = useRef(false)

  const load = useCallback(async () => {
    // Don't show spinner on poll refreshes after initial load
    if (!hasFetchedRef.current) setMarketsLoading(true)

    const { data, error } = await fetchMarkets({ limit, tag, order })

    if (error || !data || data.length === 0) {
      // ── Fallback: use mock data ──────────────────────────────────────
      console.warn('[useMarkets] API unavailable, using mock data:', error)
      setMarketsError(error ?? 'No data returned')
      setMarkets(mockMarkets)
      setDataMode('demo')
    } else {
      const normalised = data.map(normaliseMarket)
      setMarkets(normalised)
      setMarketsError(null)
      setDataMode('live')
    }

    setMarketsLoading(false)
    hasFetchedRef.current = true
  }, [tag, order, limit, setMarkets, setMarketsLoading, setMarketsError, setDataMode])

  useEffect(() => {
    load()
    if (pollMs > 0) {
      intervalRef.current = setInterval(load, pollMs)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [load, pollMs])

  return { refetch: load }
}

// ── useOrderBook ─────────────────────────────────────────────────────────────
/**
 * Fetches & auto-refreshes an order book for one token.
 * Falls back to a generated synthetic order book when offline.
 */
export function useOrderBook(tokenId, pollMs = 5_000) {
  const setOrderBook = useStore((s) => s.setOrderBook)
  const intervalRef  = useRef(null)

  const makeSyntheticBook = useCallback((tokenId) => {
    // Generate plausible bids/asks around a midpoint derived from the token id hash
    const seed = tokenId ? parseInt(tokenId.slice(-4), 16) / 0xffff : 0.5
    const mid = 0.3 + seed * 0.4 // price between 0.30 and 0.70
    const bids = Array.from({ length: 8 }, (_, i) => ({
      price: (mid - (i + 1) * 0.005).toFixed(4),
      size:  (Math.random() * 900 + 100).toFixed(1),
    }))
    const asks = Array.from({ length: 8 }, (_, i) => ({
      price: (mid + (i + 1) * 0.005).toFixed(4),
      size:  (Math.random() * 900 + 100).toFixed(1),
    }))
    return { bids, asks }
  }, [])

  const load = useCallback(async () => {
    if (!tokenId) return

    const { data, error } = await fetchOrderBook(tokenId)

    if (error || !data) {
      setOrderBook(makeSyntheticBook(tokenId))
    } else {
      setOrderBook(data)
    }
  }, [tokenId, setOrderBook, makeSyntheticBook])

  useEffect(() => {
    load()
    if (pollMs > 0) {
      intervalRef.current = setInterval(load, pollMs)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [load, pollMs])

  return { refetch: load }
}

// ── usePriceHistory ──────────────────────────────────────────────────────────
/**
 * Fetches historical price data for a token.
 * Falls back to a generated sine-wave series when offline.
 */
export function usePriceHistory(tokenId, fidelity = 60) {
  const setPriceHistory        = useStore((s) => s.setPriceHistory)
  const setPriceHistoryLoading = useStore((s) => s.setPriceHistoryLoading)

  const makeSyntheticHistory = useCallback((tokenId) => {
    const seed  = tokenId ? parseInt(tokenId.slice(-4), 16) / 0xffff : 0.5
    const base  = 0.25 + seed * 0.45
    const now   = Date.now()
    const hours = 30 * 24 // 30 days hourly
    let price   = base
    return Array.from({ length: hours }, (_, i) => {
      price = Math.max(0.02, Math.min(0.98, price + (Math.random() - 0.49) * 0.012))
      const ts = Math.floor((now - (hours - i) * 3_600_000) / 1000)
      return {
        time: new Date(ts * 1000).toLocaleString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
        }),
        price: parseFloat(price.toFixed(4)),
        timestamp: ts,
      }
    }).filter((_, i) => i % 6 === 0) // thin to every 6h for display
  }, [])

  const load = useCallback(async () => {
    if (!tokenId) return
    setPriceHistoryLoading(true)
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 86400
    const { data, error } = await fetchPriceHistory(tokenId, fidelity, thirtyDaysAgo)

    if (error || !data || data.length === 0) {
      setPriceHistory(makeSyntheticHistory(tokenId))
    } else {
      setPriceHistory(data)
    }
    setPriceHistoryLoading(false)
  }, [tokenId, fidelity, setPriceHistory, setPriceHistoryLoading, makeSyntheticHistory])

  useEffect(() => {
    load()
  }, [load])

  return { refetch: load }
}
