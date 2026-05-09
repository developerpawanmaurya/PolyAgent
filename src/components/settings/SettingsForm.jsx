import React, { useState } from 'react'
import clsx from 'clsx'
import { CheckCircle, AlertCircle } from 'lucide-react'
import useStore from '../../store/useStore'

const RISK_OPTIONS = [
  { value: 'conservative', label: 'Conservative', desc: 'Lower EV threshold, smaller positions' },
  { value: 'moderate',     label: 'Moderate',     desc: 'Balanced risk/reward' },
  { value: 'aggressive',   label: 'Aggressive',   desc: 'Higher EV threshold, larger swings' },
]

const CATEGORY_OPTIONS = ['Crypto', 'AI', 'Politics', 'Science', 'Economics', 'Sports', 'Pop Culture', 'Geopolitics']

/**
 * SettingsForm — agent configuration with client-side validation.
 */
export default function SettingsForm() {
  const settings      = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const saveSettings  = useStore((s) => s.saveSettings)
  const settingsSaved = useStore((s) => s.settingsSaved)

  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (settings.max_bet_usdc < 1 || settings.max_bet_usdc > 10000)
      e.max_bet_usdc = 'Must be between $1 and $10,000'
    if (settings.min_bet_usdc < 1 || settings.min_bet_usdc >= settings.max_bet_usdc)
      e.min_bet_usdc = 'Must be ≥ $1 and less than max bet'
    if (settings.ev_threshold < 0.01 || settings.ev_threshold > 0.5)
      e.ev_threshold = 'Must be between 0.01 and 0.50'
    if (settings.max_open_positions < 1 || settings.max_open_positions > 50)
      e.max_open_positions = 'Must be between 1 and 50'
    if (settings.slippage_tolerance < 0.001 || settings.slippage_tolerance > 0.1)
      e.slippage_tolerance = 'Must be between 0.001 and 0.10'
    if (settings.categories.length === 0)
      e.categories = 'Select at least one category'
    return e
  }

  const handleSave = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      saveSettings()
    }
  }

  const toggleCategory = (cat) => {
    const current = settings.categories
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat]
    updateSettings({ categories: next })
  }

  const Field = ({ label, hint, error, children }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-300">{label}</label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-500">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-loss">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSave} className="card p-5 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Agent Configuration</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Adjust trading parameters. Changes are applied on next agent cycle.
        </p>
      </div>

      {/* Position sizing */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-medium uppercase tracking-widest text-slate-500">Position Sizing</h3>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Max Bet Size (USDC)" hint="Maximum USDC per trade" error={errors.max_bet_usdc}>
            <div className="flex items-center gap-0">
              <span className="px-2.5 py-2 text-xs font-mono text-slate-400 bg-surface-3 border border-r-0 border-border rounded-l-lg">$</span>
              <input
                type="number"
                value={settings.max_bet_usdc}
                onChange={(e) => updateSettings({ max_bet_usdc: +e.target.value })}
                className={clsx('input-field rounded-l-none flex-1', errors.max_bet_usdc && 'border-loss focus:ring-loss/50')}
                min={1} max={10000}
              />
            </div>
          </Field>

          <Field label="Min Bet Size (USDC)" hint="Minimum USDC per trade" error={errors.min_bet_usdc}>
            <div className="flex items-center">
              <span className="px-2.5 py-2 text-xs font-mono text-slate-400 bg-surface-3 border border-r-0 border-border rounded-l-lg">$</span>
              <input
                type="number"
                value={settings.min_bet_usdc}
                onChange={(e) => updateSettings({ min_bet_usdc: +e.target.value })}
                className={clsx('input-field rounded-l-none flex-1', errors.min_bet_usdc && 'border-loss focus:ring-loss/50')}
                min={1}
              />
            </div>
          </Field>

          <Field label="Max Open Positions" hint="Concurrent position limit" error={errors.max_open_positions}>
            <input
              type="number"
              value={settings.max_open_positions}
              onChange={(e) => updateSettings({ max_open_positions: +e.target.value })}
              className={clsx('input-field', errors.max_open_positions && 'border-loss focus:ring-loss/50')}
              min={1} max={50}
            />
          </Field>

          <Field label="Auto-Close at (%)" hint="Take profit at X% unrealized gain" error={errors.auto_close_at_pct}>
            <input
              type="number"
              value={settings.auto_close_at_pct}
              onChange={(e) => updateSettings({ auto_close_at_pct: +e.target.value })}
              className="input-field"
              min={10} max={200}
            />
          </Field>
        </div>
      </section>

      {/* Risk & thresholds */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-medium uppercase tracking-widest text-slate-500">Risk & Thresholds</h3>

        <Field label="Risk Tolerance">
          <div className="grid grid-cols-3 gap-2">
            {RISK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateSettings({ risk_tolerance: opt.value })}
                className={clsx(
                  'flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-150',
                  settings.risk_tolerance === opt.value
                    ? 'bg-emerald-900/30 border-emerald-700/60 text-white'
                    : 'bg-surface-3 border-border text-slate-400 hover:border-slate-600'
                )}
              >
                <span className="text-xs font-medium">{opt.label}</span>
                <span className="text-[10px] mt-0.5 leading-snug">{opt.desc}</span>
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="EV Threshold"
            hint={`Minimum edge: ${(settings.ev_threshold * 100).toFixed(0)}% above market`}
            error={errors.ev_threshold}
          >
            <input
              type="number"
              value={settings.ev_threshold}
              onChange={(e) => updateSettings({ ev_threshold: +e.target.value })}
              className={clsx('input-field font-mono', errors.ev_threshold && 'border-loss')}
              step={0.01} min={0.01} max={0.5}
            />
          </Field>

          <Field
            label="Slippage Tolerance"
            hint={`Max slippage: ${(settings.slippage_tolerance * 100).toFixed(1)}%`}
            error={errors.slippage_tolerance}
          >
            <input
              type="number"
              value={settings.slippage_tolerance}
              onChange={(e) => updateSettings({ slippage_tolerance: +e.target.value })}
              className={clsx('input-field font-mono', errors.slippage_tolerance && 'border-loss')}
              step={0.001} min={0.001} max={0.1}
            />
          </Field>
        </div>
      </section>

      {/* Market categories */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-medium uppercase tracking-widest text-slate-500">Market Categories</h3>
        {errors.categories && (
          <p className="flex items-center gap-1 text-[11px] text-loss">
            <AlertCircle size={11} /> {errors.categories}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((cat) => {
            const active = settings.categories.includes(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                  active
                    ? 'bg-emerald-900/40 border-emerald-700/60 text-neon-green'
                    : 'bg-surface-3 border-border text-slate-400 hover:text-white hover:border-slate-600'
                )}
              >
                {active && '✓ '}{cat}
              </button>
            )
          })}
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        {settingsSaved ? (
          <p className="flex items-center gap-1.5 text-xs text-profit">
            <CheckCircle size={13} /> Settings saved successfully
          </p>
        ) : (
          <p className="text-xs text-slate-500">Unsaved changes</p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => updateSettings({})}
          >
            Reset
          </button>
          <button type="submit" className="btn-primary">
            Save Configuration
          </button>
        </div>
      </div>
    </form>
  )
}
