import React from 'react'
import useStore from '../store/useStore'
import PositionsTable from '../components/positions/PositionsTable'
import LimitOrdersPanel from '../components/positions/LimitOrdersPanel'

export default function Positions() {
  const positions   = useStore((s) => s.positions)
  const limitOrders = useStore((s) => s.limitOrders)

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto px-6 py-5">
      <div className="flex-1 min-h-0">
        <PositionsTable positions={positions} />
      </div>
      <div>
        <LimitOrdersPanel orders={limitOrders} />
      </div>
    </div>
  )
}
