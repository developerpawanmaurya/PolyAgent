// ─── Mock Agent State ───────────────────────────────────────────────
export const initialAgentState = {
  agent_status: 'active',
  wallet_balance: 1450.5,
  total_pnl: 125.75,
  pnl_24h: 18.42,
  volume_24h: 340.0,
  win_loss: { wins: 34, losses: 12 },
}

// ─── PnL Time Series (30d) ──────────────────────────────────────────
const generatePnLSeries = () => {
  const series = []
  let pnl = 0
  const now = Date.now()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 86_400_000)
    pnl += (Math.random() - 0.38) * 22
    series.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pnl: parseFloat(pnl.toFixed(2)),
    })
  }
  return series
}

export const pnlSeries = generatePnLSeries()

// ─── Active Positions ───────────────────────────────────────────────
export const activePositions = [
  {
    market_id: '0xabc1',
    question: 'Will SpaceX launch Starship in May 2026?',
    side: 'YES',
    shares: 500,
    avg_price: 0.45,
    current_price: 0.62,
    category: 'Science',
  },
  {
    market_id: '0xabc2',
    question: 'Will ETH exceed $4,000 before June 1?',
    side: 'YES',
    shares: 300,
    avg_price: 0.38,
    current_price: 0.51,
    category: 'Crypto',
  },
  {
    market_id: '0xabc3',
    question: 'Will the Fed cut rates in May 2026?',
    side: 'NO',
    shares: 750,
    avg_price: 0.72,
    current_price: 0.64,
    category: 'Economics',
  },
  {
    market_id: '0xabc4',
    question: 'Will Bitcoin reach $120k by end of Q2?',
    side: 'YES',
    shares: 200,
    avg_price: 0.29,
    current_price: 0.34,
    category: 'Crypto',
  },
  {
    market_id: '0xabc5',
    question: 'Will AI surpass human performance on ARC-AGI in 2026?',
    side: 'NO',
    shares: 400,
    avg_price: 0.55,
    current_price: 0.48,
    category: 'AI',
  },
]

// ─── Limit Orders ───────────────────────────────────────────────────
export const limitOrders = [
  {
    order_id: 'ORD-001',
    question: 'Will GPT-5 launch by May 2026?',
    side: 'YES',
    limit_price: 0.42,
    current_price: 0.39,
    fill_pct: 78,
    size_usdc: 100,
  },
  {
    order_id: 'ORD-002',
    question: 'Will US unemployment exceed 5% in Q2?',
    side: 'NO',
    limit_price: 0.68,
    current_price: 0.71,
    fill_pct: 12,
    size_usdc: 50,
  },
]

// ─── Trade History ──────────────────────────────────────────────────
export const tradeHistory = [
  {
    id: 'TRD-001',
    question: 'Will Nvidia hit $1200 in April?',
    side: 'YES',
    entry: 0.31,
    exit: 0.58,
    shares: 400,
    realized_pnl: 108.0,
    closed_at: '2026-04-22T14:33:00Z',
  },
  {
    id: 'TRD-002',
    question: 'Will the S&P 500 fall 10% in April?',
    side: 'NO',
    entry: 0.74,
    exit: 0.88,
    shares: 250,
    realized_pnl: 35.0,
    closed_at: '2026-04-21T09:12:00Z',
  },
  {
    id: 'TRD-003',
    question: 'Will OpenAI announce GPT-5 in April?',
    side: 'YES',
    entry: 0.55,
    exit: 0.22,
    shares: 300,
    realized_pnl: -99.0,
    closed_at: '2026-04-20T17:55:00Z',
  },
  {
    id: 'TRD-004',
    question: 'Will BTC dominance exceed 60% in April?',
    side: 'YES',
    entry: 0.44,
    exit: 0.71,
    shares: 500,
    realized_pnl: 135.0,
    closed_at: '2026-04-19T11:28:00Z',
  },
  {
    id: 'TRD-005',
    question: 'Will Cardano launch a major upgrade in Q2?',
    side: 'NO',
    entry: 0.62,
    exit: 0.49,
    shares: 200,
    realized_pnl: 26.0,
    closed_at: '2026-04-18T08:04:00Z',
  },
]

// ─── System Logs ────────────────────────────────────────────────────
export const initialLogs = [
  { id: 1, timestamp: '2026-04-24T01:30:00Z', level: 'INFO',  message: 'Agent initialized. Wallet loaded. Balance: $1,450.50 USDC.' },
  { id: 2, timestamp: '2026-04-24T01:31:15Z', level: 'INFO',  message: 'Fetching open markets from Polymarket API...' },
  { id: 3, timestamp: '2026-04-24T01:31:18Z', level: 'INFO',  message: 'Scanned 50 markets for arbitrage opportunities.' },
  { id: 4, timestamp: '2026-04-24T01:32:00Z', level: 'INFO',  message: 'Evaluating market: "Will ETH exceed $4,000 before June 1?"' },
  { id: 5, timestamp: '2026-04-24T01:32:03Z', level: 'DEBUG', message: 'EV model: YES@0.38 expected value +14.2% above threshold.' },
  { id: 6, timestamp: '2026-04-24T01:32:05Z', level: 'INFO',  message: 'Order submitted: BUY 300 YES shares @ $0.38 USDC each.' },
  { id: 7, timestamp: '2026-04-24T01:32:06Z', level: 'SUCCESS','message': 'Order confirmed. Position opened. Order ID: 0x7f3a...' },
  { id: 8, timestamp: '2026-04-24T01:33:00Z', level: 'INFO',  message: 'Scanning next batch of 50 markets...' },
  { id: 9, timestamp: '2026-04-24T01:33:45Z', level: 'WARN',  message: 'Market "GPT-5 by April?" spread too wide. Skipping.' },
  { id: 10, timestamp: '2026-04-24T01:45:00Z', level: 'INFO', message: 'Heartbeat: 5 active positions. Balance: $1,450.50 USDC.' },
]

// Simulated incoming log messages for auto-scroll demo
export const streamingLogMessages = [
  { level: 'INFO',    message: 'Scanning 50 markets for arbitrage opportunities...' },
  { level: 'DEBUG',   message: 'Market "Fed rate cut May?" — YES@0.28, EV below threshold. Skip.' },
  { level: 'INFO',    message: 'Evaluating market: "Will Bitcoin reach $120k by end of Q2?"' },
  { level: 'DEBUG',   message: 'EV model: YES@0.34 expected value +8.1%. Borderline.' },
  { level: 'INFO',    message: 'Checking liquidity depth for 0xabc4...' },
  { level: 'SUCCESS', message: 'Limit order placed: BUY 100 YES @ $0.32 (0xabc4).' },
  { level: 'WARN',    message: 'Slippage detected on market 0xdef9. Order adjusted.' },
  { level: 'INFO',    message: 'Position 0xabc1 mark-to-market: +$85.00 unrealized.' },
  { level: 'INFO',    message: 'Heartbeat: 5 active positions. No new signals.' },
  { level: 'DEBUG',   message: 'Polling interval: 60s. Next scan at 01:47:00Z.' },
]

// ─── Mock Markets (Polymarket-shaped, used as fallback when API is offline) ──
// Mirrors the shape produced by normaliseMarket() in polymarketApi.js
const makeTokenId = (seed) => `0x${seed.toString(16).padStart(64, '0')}`

export const mockMarkets = [
  {
    id: 'mock-1', conditionId: '0xaaa1', slug: 'will-eth-exceed-4000-june',
    question: 'Will ETH exceed $4,000 before June 1, 2026?',
    description: 'Resolves YES if ETH/USD closes above $4,000 on any day before June 1 2026.',
    yesPrice: 0.54, noPrice: 0.46, volume: 1_420_000, volume24h: 87_400, liquidity: 310_000,
    active: true, closed: false,
    endDate: '2026-06-01T00:00:00Z', startDate: '2026-01-10T00:00:00Z',
    tags: [{ slug: 'crypto', label: 'Crypto' }], category: 'Crypto',
    yesTokenId: makeTokenId(1001), noTokenId: makeTokenId(1002),
    tokens: [{ token_id: makeTokenId(1001), outcome: 'Yes' }, { token_id: makeTokenId(1002), outcome: 'No' }],
  },
  {
    id: 'mock-2', conditionId: '0xaaa2', slug: 'will-bitcoin-reach-120k-q2',
    question: 'Will Bitcoin reach $120,000 by end of Q2 2026?',
    description: 'Resolves YES if BTC/USD touches $120,000 on any exchange before June 30 2026.',
    yesPrice: 0.34, noPrice: 0.66, volume: 3_100_000, volume24h: 210_000, liquidity: 780_000,
    active: true, closed: false,
    endDate: '2026-06-30T00:00:00Z', startDate: '2025-12-01T00:00:00Z',
    tags: [{ slug: 'crypto', label: 'Crypto' }], category: 'Crypto',
    yesTokenId: makeTokenId(1003), noTokenId: makeTokenId(1004),
    tokens: [{ token_id: makeTokenId(1003), outcome: 'Yes' }, { token_id: makeTokenId(1004), outcome: 'No' }],
  },
  {
    id: 'mock-3', conditionId: '0xaaa3', slug: 'will-fed-cut-rates-may-2026',
    question: 'Will the Federal Reserve cut rates at the May 2026 FOMC meeting?',
    description: 'Resolves YES if the Fed announces a rate cut (any size) at the May 6-7 FOMC.',
    yesPrice: 0.28, noPrice: 0.72, volume: 890_000, volume24h: 43_000, liquidity: 220_000,
    active: true, closed: false,
    endDate: '2026-05-07T21:00:00Z', startDate: '2026-02-15T00:00:00Z',
    tags: [{ slug: 'economics', label: 'Economics' }], category: 'Economics',
    yesTokenId: makeTokenId(1005), noTokenId: makeTokenId(1006),
    tokens: [{ token_id: makeTokenId(1005), outcome: 'Yes' }, { token_id: makeTokenId(1006), outcome: 'No' }],
  },
  {
    id: 'mock-4', conditionId: '0xaaa4', slug: 'spacex-starship-launch-may-2026',
    question: 'Will SpaceX successfully launch Starship to orbit in May 2026?',
    description: 'Resolves YES if Starship reaches orbital velocity and completes at least one full orbit.',
    yesPrice: 0.61, noPrice: 0.39, volume: 540_000, volume24h: 31_200, liquidity: 150_000,
    active: true, closed: false,
    endDate: '2026-05-31T23:59:00Z', startDate: '2026-03-20T00:00:00Z',
    tags: [{ slug: 'science', label: 'Science' }], category: 'Science',
    yesTokenId: makeTokenId(1007), noTokenId: makeTokenId(1008),
    tokens: [{ token_id: makeTokenId(1007), outcome: 'Yes' }, { token_id: makeTokenId(1008), outcome: 'No' }],
  },
  {
    id: 'mock-5', conditionId: '0xaaa5', slug: 'will-gpt5-launch-q2-2026',
    question: 'Will OpenAI release GPT-5 publicly before July 1, 2026?',
    description: 'Resolves YES if OpenAI makes GPT-5 available via API or ChatGPT before July 1.',
    yesPrice: 0.47, noPrice: 0.53, volume: 2_300_000, volume24h: 158_000, liquidity: 640_000,
    active: true, closed: false,
    endDate: '2026-06-30T23:59:00Z', startDate: '2026-01-05T00:00:00Z',
    tags: [{ slug: 'ai', label: 'AI' }], category: 'AI',
    yesTokenId: makeTokenId(1009), noTokenId: makeTokenId(1010),
    tokens: [{ token_id: makeTokenId(1009), outcome: 'Yes' }, { token_id: makeTokenId(1010), outcome: 'No' }],
  },
  {
    id: 'mock-6', conditionId: '0xaaa6', slug: 'btc-dominance-60-percent-q2',
    question: 'Will BTC market dominance exceed 60% in Q2 2026?',
    description: 'Resolves YES if CoinGecko BTC dominance closes above 60% on any day in Q2.',
    yesPrice: 0.71, noPrice: 0.29, volume: 760_000, volume24h: 55_900, liquidity: 195_000,
    active: true, closed: false,
    endDate: '2026-06-30T23:59:00Z', startDate: '2026-04-01T00:00:00Z',
    tags: [{ slug: 'crypto', label: 'Crypto' }], category: 'Crypto',
    yesTokenId: makeTokenId(1011), noTokenId: makeTokenId(1012),
    tokens: [{ token_id: makeTokenId(1011), outcome: 'Yes' }, { token_id: makeTokenId(1012), outcome: 'No' }],
  },
  {
    id: 'mock-7', conditionId: '0xaaa7', slug: 'us-unemployment-5-percent-q2',
    question: 'Will US unemployment exceed 5% in Q2 2026?',
    description: 'Resolves YES if BLS official unemployment rate is reported above 5% for any Q2 month.',
    yesPrice: 0.19, noPrice: 0.81, volume: 430_000, volume24h: 18_700, liquidity: 110_000,
    active: true, closed: false,
    endDate: '2026-07-05T00:00:00Z', startDate: '2026-01-20T00:00:00Z',
    tags: [{ slug: 'economics', label: 'Economics' }], category: 'Economics',
    yesTokenId: makeTokenId(1013), noTokenId: makeTokenId(1014),
    tokens: [{ token_id: makeTokenId(1013), outcome: 'Yes' }, { token_id: makeTokenId(1014), outcome: 'No' }],
  },
  {
    id: 'mock-8', conditionId: '0xaaa8', slug: 'anthropic-claude-4-launch',
    question: 'Will Anthropic release Claude 4 before August 2026?',
    description: 'Resolves YES if Anthropic publicly launches a model branded as Claude 4 before August 1.',
    yesPrice: 0.82, noPrice: 0.18, volume: 1_050_000, volume24h: 76_300, liquidity: 285_000,
    active: true, closed: false,
    endDate: '2026-07-31T23:59:00Z', startDate: '2026-03-01T00:00:00Z',
    tags: [{ slug: 'ai', label: 'AI' }], category: 'AI',
    yesTokenId: makeTokenId(1015), noTokenId: makeTokenId(1016),
    tokens: [{ token_id: makeTokenId(1015), outcome: 'Yes' }, { token_id: makeTokenId(1016), outcome: 'No' }],
  },
  {
    id: 'mock-9', conditionId: '0xaaa9', slug: 'nvidia-sp500-largest-company',
    question: 'Will Nvidia become the largest S&P 500 company by market cap in Q2 2026?',
    description: 'Resolves YES if NVDA market cap surpasses all other S&P 500 members on any single trading day.',
    yesPrice: 0.44, noPrice: 0.56, volume: 1_880_000, volume24h: 134_200, liquidity: 510_000,
    active: true, closed: false,
    endDate: '2026-06-30T23:59:00Z', startDate: '2026-02-01T00:00:00Z',
    tags: [{ slug: 'economics', label: 'Economics' }], category: 'Economics',
    yesTokenId: makeTokenId(1017), noTokenId: makeTokenId(1018),
    tokens: [{ token_id: makeTokenId(1017), outcome: 'Yes' }, { token_id: makeTokenId(1018), outcome: 'No' }],
  },
  {
    id: 'mock-10', conditionId: '0xaaa10', slug: 'doge-above-1-dollar-q2',
    question: 'Will Dogecoin trade above $1.00 at any point in Q2 2026?',
    description: 'Resolves YES if DOGE/USD spot price touches $1.00 on any major CEX during Q2.',
    yesPrice: 0.23, noPrice: 0.77, volume: 620_000, volume24h: 41_500, liquidity: 175_000,
    active: true, closed: false,
    endDate: '2026-06-30T23:59:00Z', startDate: '2026-01-15T00:00:00Z',
    tags: [{ slug: 'crypto', label: 'Crypto' }], category: 'Crypto',
    yesTokenId: makeTokenId(1019), noTokenId: makeTokenId(1020),
    tokens: [{ token_id: makeTokenId(1019), outcome: 'Yes' }, { token_id: makeTokenId(1020), outcome: 'No' }],
  },
  {
    id: 'mock-11', conditionId: '0xaaa11', slug: 'arc-agi-benchmark-2026',
    question: 'Will any AI system score >85% on ARC-AGI benchmark by end of 2026?',
    description: 'Resolves YES if a publicly verifiable AI system reports >85% on the ARC-AGI test set.',
    yesPrice: 0.58, noPrice: 0.42, volume: 340_000, volume24h: 22_800, liquidity: 98_000,
    active: true, closed: false,
    endDate: '2026-12-31T23:59:00Z', startDate: '2026-01-01T00:00:00Z',
    tags: [{ slug: 'ai', label: 'AI' }], category: 'AI',
    yesTokenId: makeTokenId(1021), noTokenId: makeTokenId(1022),
    tokens: [{ token_id: makeTokenId(1021), outcome: 'Yes' }, { token_id: makeTokenId(1022), outcome: 'No' }],
  },
  {
    id: 'mock-12', conditionId: '0xaaa12', slug: 'solana-above-400-q2',
    question: 'Will Solana (SOL) exceed $400 before July 2026?',
    description: 'Resolves YES if SOL/USD spot price closes above $400 on any day before July 1.',
    yesPrice: 0.39, noPrice: 0.61, volume: 940_000, volume24h: 67_100, liquidity: 260_000,
    active: true, closed: false,
    endDate: '2026-06-30T23:59:00Z', startDate: '2026-02-10T00:00:00Z',
    tags: [{ slug: 'crypto', label: 'Crypto' }], category: 'Crypto',
    yesTokenId: makeTokenId(1023), noTokenId: makeTokenId(1024),
    tokens: [{ token_id: makeTokenId(1023), outcome: 'Yes' }, { token_id: makeTokenId(1024), outcome: 'No' }],
  },
]

// ─── Default Settings ────────────────────────────────────────────────
export const defaultSettings = {
  max_bet_usdc: 200,
  min_bet_usdc: 10,
  risk_tolerance: 'moderate',
  ev_threshold: 0.08,
  max_open_positions: 10,
  categories: ['Crypto', 'AI', 'Science'],
  slippage_tolerance: 0.02,
  auto_close_at_pct: 80,
}
