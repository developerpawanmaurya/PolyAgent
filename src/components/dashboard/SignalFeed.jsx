/**
 * SignalFeed.jsx
 * Simulated AI reasoning feed — shows the agent's most recent
 * market evaluation signals with confidence scores.
 */

import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { Brain, ChevronRight } from 'lucide-react'

const MOCK_SIGNALS = [
  { market: 'Will ETH exceed $4k before June?',  side: 'YES', confidence: 0.78, ev: '+14.2%', reason: 'On-chain accumulation spike, historically bullish Q2.' },
  { market: 'Will Fed cut rates in May 2026?',    side: 'NO',  confidence: 0.65, ev: '+9.1%',  reason: 'PCE still elevated, FOMC language remains hawkish.' },
  { market: 'Will BTC dominance hit 62% in Q2?',  side: 'YES', confidence: 0.71, ev: '+11.5%', reason: 'Alt rotation slowing, BTC ETF inflows re-accelerating.' },
  { market: 'Will GPT-5 release in May 2026?',    side: 'NO',  confidence: 0.58, ev: '+6.2%',  reason: 'No credible leak; OpenAI silence historically = delay.' },
  { market: 'SpaceX Starship May launch?',         side: 'YES', confidence: 0.83, ev: '+18.3%', reason: 'FAA license reportedly cleared, pad ready per insiders.' },
]

const ConfidenceBar = ({ value }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1 rounded-full bg-surface-4">
      <div
        className={clsx('h-full rounded-full', value >= 0.7 ? 'bg-neon-green' : value >= 0.55 ? 'bg-warn' : 'bg-loss')}
        style={{ width: `${value * 100}%` }}
      />
    </div>
    <span className={clsx('text-[10px] font-mono shrink-0', value >= 0.7 ? 'text-profit' : value >= 0.55 ? 'text-warn' : 'text-loss')}>
      {(value * 100).toFixed(0)}%
    </span>
  </div>
)

export default function SignalFeed() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % MOCK_SIGNALS.length), 4_000)
    return () => clearInterval(t)
  }, [])

  const signal = MOCK_SIGNALS[active]

  return (
    <div className="card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <Brain size={14} className="text-neon-purple" />
        <p className="text-xs font-semibold text-white">AI Signal Feed</p>
        <span className="ml-auto text-[10px] font-mono text-slate-500">{active + 1}/{MOCK_SIGNALS.length}</span>
      </div>

      <div className="flex-1 space-y-2 animate-slide_in" key={active}>
        <p className="text-xs text-white font-medium leading-snug">{signal.market}</p>
        <div className="flex items-center gap-2">
          <span className={signal.side === 'YES' ? 'badge-yes' : 'badge-no'}>{signal.side}</span>
          <span className="text-[11px] font-mono text-neon-green">{signal.ev} EV</span>
        </div>
        <ConfidenceBar value={signal.confidence} />
        <p className="text-[11px] text-slate-400 leading-snug">{signal.reason}</p>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5">
        {MOCK_SIGNALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={clsx('w-1.5 h-1.5 rounded-full transition-all', i === active ? 'bg-neon-green w-3' : 'bg-slate-600')}
          />
        ))}
      </div>
    </div>
  )
}
