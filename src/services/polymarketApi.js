/**
 * polymarketApi.js
 * ──────────────────────────────────────────────────────────────────────────
 * Thin, typed service layer over the Polymarket public REST APIs.
 *
 * Gamma API  → https://gamma-api.polymarket.com   (market metadata, events)
 * CLOB API   → https://clob.polymarket.com        (prices, order books)
 *
 * All endpoints are public read-only — no API key required.
 * Each function returns a consistent { data, error } envelope so callers
 * never need to wrap in try/catch themselves.
 * ──────────────────────────────────────────────────────────────────────────
 */

// In dev, route through Vite's proxy (see vite.config.js) so the browser
// makes same-origin requests — this bypasses Polymarket's missing CORS
// headers. In production, hit the real APIs directly (or wire up your
// own backend proxy and point these at it).
const GAMMA_BASE = import.meta.env.DEV ? '/api/gamma' : 'https://gamma-api.polymarket.com'
const CLOB_BASE  = import.meta.env.DEV ? '/api/clob'  : 'https://clob.polymarket.com'

// ── Shared fetch wrapper ─────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(options.timeout ?? 10_000),
      ...options,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return { data: null, error: `HTTP ${res.status}: ${text}` }
    }
    const data = await res.json()
    return { data, error: null }
  } catch (err) {
    if (err.name === 'TimeoutError') return { data: null, error: 'Request timed out' }
    return { data: null, error: err.message ?? 'Unknown error' }
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  GAMMA API — Market metadata
// ════════════════════════════════════════════════════════════════════════════

/**
 * Fetch active markets from the Gamma API.
 *
 * @param {object} opts
 * @param {number}  opts.limit      - Max results (default 20)
 * @param {string}  opts.tag        - Filter by tag slug (e.g. "crypto")
 * @param {string}  opts.order      - Sort field: "volume24hr" | "liquidity" | "startDate"
 * @param {string}  opts.ascending  - "false" for descending (default false)
 * @returns {Promise<{data: Market[]|null, error: string|null}>}
 */
export async function fetchMarkets({
  limit = 20,
  tag = '',
  order = 'volume24hr',
  ascending = 'false',
  closed = 'false',
} = {}) {
  const params = new URLSearchParams({
    active: 'true',
    closed,
    limit,
    order,
    ascending,
    ...(tag ? { tag_slug: tag } : {}),
  })
  return apiFetch(`${GAMMA_BASE}/markets?${params}`)
}

/**
 * Fetch a single market by slug.
 * @param {string} slug
 */
export async function fetchMarketBySlug(slug) {
  return apiFetch(`${GAMMA_BASE}/markets?slug=${encodeURIComponent(slug)}`)
}

/**
 * Fetch active events (groups of related markets).
 * @param {number} limit
 */
export async function fetchEvents(limit = 10) {
  const params = new URLSearchParams({ active: 'true', limit, ascending: 'false' })
  return apiFetch(`${GAMMA_BASE}/events?${params}`)
}

/**
 * Search markets by question text (client-side filter over a larger fetch).
 * @param {string} query
 * @param {number} limit
 */
export async function searchMarkets(query, limit = 50) {
  const { data, error } = await fetchMarkets({ limit })
  if (error || !data) return { data: null, error }
  const q = query.toLowerCase()
  return {
    data: data.filter((m) => m.question?.toLowerCase().includes(q)),
    error: null,
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  CLOB API — Prices & Order Books
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get best BUY / SELL price for a token.
 * @param {string} tokenId  - The YES or NO token_id from the market object
 * @param {'BUY'|'SELL'} side
 */
export async function fetchPrice(tokenId, side = 'BUY') {
  const { data, error } = await apiFetch(
    `${CLOB_BASE}/price?token_id=${tokenId}&side=${side}`
  )
  return { data: data?.price ? parseFloat(data.price) : null, error }
}

/**
 * Get midpoint price for a token.
 * @param {string} tokenId
 */
export async function fetchMidpoint(tokenId) {
  const { data, error } = await apiFetch(`${CLOB_BASE}/midpoint?token_id=${tokenId}`)
  return { data: data?.mid ? parseFloat(data.mid) : null, error }
}

/**
 * Get full order book (bids + asks) for a token.
 * @param {string} tokenId
 */
export async function fetchOrderBook(tokenId) {
  return apiFetch(`${CLOB_BASE}/book?token_id=${tokenId}`)
}

/**
 * Get price history for a token.
 * @param {string} tokenId
 * @param {number} fidelity  - Interval in minutes (1, 5, 60, 1440)
 * @param {number} startTs   - Unix timestamp for start of range
 */
export async function fetchPriceHistory(tokenId, fidelity = 60, startTs = null) {
  const params = new URLSearchParams({ market: tokenId, fidelity })
  if (startTs) params.set('startTs', startTs)
  const { data, error } = await apiFetch(`${CLOB_BASE}/prices-history?${params}`)
  // Normalize to { time, price } format
  const normalized = data?.history?.map((p) => ({
    time: new Date(p.t * 1000).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
    }),
    price: parseFloat(p.p),
    timestamp: p.t,
  })) ?? null
  return { data: normalized, error }
}

/**
 * Get spread for a token (ask - bid).
 * @param {string} tokenId
 */
export async function fetchSpread(tokenId) {
  const { data, error } = await apiFetch(`${CLOB_BASE}/spread?token_id=${tokenId}`)
  return { data: data?.spread ? parseFloat(data.spread) : null, error }
}

/**
 * Batch-fetch midpoints for multiple token IDs.
 * Returns a map: { [tokenId]: price }
 * @param {string[]} tokenIds
 */
export async function fetchMidpoints(tokenIds) {
  if (!tokenIds.length) return { data: {}, error: null }
  const results = await Promise.allSettled(
    tokenIds.map((id) => fetchMidpoint(id).then(({ data }) => [id, data]))
  )
  const map = {}
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value[1] !== null) {
      map[r.value[0]] = r.value[1]
    }
  }
  return { data: map, error: null }
}

// ════════════════════════════════════════════════════════════════════════════
//  Derived helpers
// ════════════════════════════════════════════════════════════════════════════

/**
 * Normalise raw Gamma market object into a consistent shape.
 * Handles quirks in the Gamma API response (arrays serialised as strings, etc.)
 */
export function normaliseMarket(raw) {
  const parseArr = (v) => {
    if (Array.isArray(v)) return v
    try { return JSON.parse(v) } catch { return [] }
  }

  const outcomePrices = parseArr(raw.outcomePrices).map(Number)
  const outcomes      = parseArr(raw.outcomes)
  // Gamma returns clobTokenIds as a JSON-encoded array of strings: ["yesTokenId","noTokenId"]
  const clobTokenIds  = parseArr(raw.clobTokenIds)
  const yesPrice      = outcomePrices[0] ?? null
  const noPrice       = outcomePrices[1] ?? null

  return {
    id:            raw.id,
    conditionId:   raw.conditionId,
    slug:          raw.slug,
    question:      raw.question ?? raw.title ?? '—',
    description:   raw.description ?? '',
    yesPrice,
    noPrice,
    volume:        raw.volumeNum ?? raw.volume ?? 0,
    volume24h:     raw.volume24hr ?? 0,
    liquidity:     raw.liquidityNum ?? raw.liquidity ?? 0,
    active:        raw.active ?? true,
    closed:        raw.closed ?? false,
    endDate:       raw.endDate ?? raw.end_date ?? null,
    startDate:     raw.startDate ?? raw.start_date ?? null,
    tags:          raw.tags ?? [],
    outcomes,
    clobTokenIds,
    // Convenience: YES is index 0, NO is index 1
    yesTokenId:    clobTokenIds[0] ?? null,
    noTokenId:     clobTokenIds[1] ?? null,
    category:      raw.category ?? (raw.tags?.[0]?.label ?? 'General'),
  }
}
