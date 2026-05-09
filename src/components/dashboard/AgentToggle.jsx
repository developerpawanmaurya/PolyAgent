import React from 'react'
import { Power, Pause } from 'lucide-react'
import useStore from '../../store/useStore'
import clsx from 'clsx'

export default function AgentToggle() {
  const agentStatus = useStore((s) => s.agentStatus)
  const toggle      = useStore((s) => s.toggleAgentStatus)
  const isActive    = agentStatus === 'active'

  return (
    <div className="card p-5 flex flex-col justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Agent Control</p>
        <p className="text-sm text-slate-300 mt-1">
          {isActive
            ? 'Agent is actively scanning and trading markets.'
            : 'Agent is paused. No new orders will be placed.'}
        </p>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
            isActive
              ? 'bg-emerald-900/30 border-emerald-600/60 shadow-neon'
              : 'bg-surface-3 border-slate-700'
          )}
        >
          {isActive ? (
            <Power size={16} className="text-neon-green" />
          ) : (
            <Pause size={16} className="text-slate-400" />
          )}
        </div>
        <div>
          <p
            className={clsx(
              'text-base font-semibold font-mono capitalize',
              isActive ? 'text-neon-green' : 'text-slate-400'
            )}
          >
            {agentStatus}
          </p>
          <p className="text-xs text-slate-500">
            {isActive ? 'Click to pause execution' : 'Click to resume execution'}
          </p>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggle}
        className={clsx(
          'w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border',
          isActive
            ? 'bg-rose-600/15 border-rose-600/40 text-rose-400 hover:bg-rose-600/25'
            : 'bg-emerald-600/20 border-emerald-600/40 text-emerald-400 hover:bg-emerald-600/30'
        )}
      >
        {isActive ? '⏸  Pause Agent' : '▶  Resume Agent'}
      </button>
    </div>
  )
}
