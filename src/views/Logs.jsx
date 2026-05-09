import React from 'react'
import useStore from '../store/useStore'
import TradeHistory from '../components/logs/TradeHistory'
import TerminalLog from '../components/logs/TerminalLog'

export default function Logs() {
  const trades = useStore((s) => s.tradeHistory)

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto px-6 py-5">
      <TradeHistory trades={trades} />
      <div className="flex-1 min-h-0" style={{ minHeight: '360px' }}>
        <TerminalLog />
      </div>
    </div>
  )
}
