import React from 'react'

export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-3 border border-border mb-4">
          <Icon size={24} className="text-slate-500" />
        </div>
      )}
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
