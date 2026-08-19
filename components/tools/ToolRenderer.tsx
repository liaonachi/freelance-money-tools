'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { getTool } from '@/tools'
import { isStandardTool } from '@/lib/tool-config'
import type {
  NumberField,
  OutputBlock,
  Primitive,
  Result,
  ResultRow,
  SelectField,
  StandardTool,
  ToggleField,
  ToolConfig,
} from '@/lib/tool-config'
import { formatValue } from '@/lib/format'
import { trackToolToTool, trackToolUse } from '@/lib/analytics'
import { getSite } from '@/lib/site-config'
import { t } from '@/messages'

export function ToolRenderer({ slug }: { slug: string }) {
  const config = getTool(slug)

  if (!config) {
    return <p className="text-center text-gray-400 py-16">{t('tools.notFound')}</p>
  }

  if (!isStandardTool(config)) {
    if (config.customRenderer) {
      const Custom = config.customRenderer
      return <Custom config={config} />
    }
    return <p className="text-center text-gray-400 py-16">{t('tools.misconfigured')}</p>
  }

  return <StandardToolRenderer config={config} />
}

function clampNumber(n: number, field: NumberField): number {
  let v = n
  if (field.min !== undefined) v = Math.max(field.min, v)
  if (field.max !== undefined) v = Math.min(field.max, v)
  return v
}

function StandardToolRenderer({ config }: { config: StandardTool }) {
  const initialValues = useMemo(() => {
    const v: Record<string, number | string | boolean> = {}
    for (const field of config.inputs) v[field.key] = field.default
    return v
  }, [config])

  const initialDisplay = useMemo(() => {
    const d: Record<string, string> = {}
    for (const field of config.inputs) {
      if (field.type === 'number') d[field.key] = String(field.default)
    }
    return d
  }, [config])

  const [values, setValues] = useState(initialValues)
  // 數字輸入的「顯示文字」跟「compute 用的值」分開存：使用者清空／打到一半（"1." "-" ""）
  // 時 display 照實顯示，values 保留上一個合法的有限數字，compute 永遠拿不到 NaN。
  const [display, setDisplay] = useState(initialDisplay)
  const hasTrackedUse = useRef(false)

  function trackFirstUse() {
    if (hasTrackedUse.current) return
    hasTrackedUse.current = true
    trackToolUse(config.slug)
  }

  function handleNumberChange(field: NumberField, raw: string) {
    trackFirstUse()
    setDisplay((d) => ({ ...d, [field.key]: raw }))
    const parsed = Number(raw)
    if (raw.trim() !== '' && Number.isFinite(parsed)) {
      setValues((v) => ({ ...v, [field.key]: clampNumber(parsed, field) }))
    }
  }

  function handleSelectChange(field: SelectField, value: string) {
    trackFirstUse()
    setValues((v) => ({ ...v, [field.key]: value }))
  }

  function handleToggleChange(field: ToggleField, checked: boolean) {
    trackFirstUse()
    setValues((v) => ({ ...v, [field.key]: checked }))
  }

  const result = useMemo(() => config.compute(values), [config, values])
  const visible = config.showOutputsWhen ? config.showOutputsWhen(result) : true

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {config.inputs.map((field) => (
          <div key={field.key} className={field.span === 2 ? 'sm:col-span-2' : undefined}>
            {field.type !== 'toggle' && (
              <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.type === 'number' && field.unit ? `（${field.unit}）` : ''}
              </label>
            )}

            {field.type === 'number' && (
              <input
                id={field.key}
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={display[field.key] ?? String(values[field.key])}
                onChange={(e) => handleNumberChange(field, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}

            {field.type === 'select' && (
              <select
                id={field.key}
                value={String(values[field.key])}
                onChange={(e) => handleSelectChange(field, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'toggle' && (
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(values[field.key])}
                  onChange={(e) => handleToggleChange(field, e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium text-gray-700">{field.label}</span>
              </label>
            )}

            {field.hint && <p className="mt-1 text-xs text-gray-400">{field.hint}</p>}
          </div>
        ))}
      </div>

      {visible && (
        <div className="space-y-4">
          {config.outputs.map((output, i) => (
            <OutputBlockRenderer key={i} output={output} result={result} />
          ))}
        </div>
      )}

      {config.cta && <CtaButton cta={config.cta} result={result} slug={config.slug} />}

      {config.footnote && <p className="text-sm text-gray-400 text-center">{config.footnote}</p>}
    </div>
  )
}

function asPrimitive(value: Primitive | ResultRow[] | undefined): Primitive {
  return Array.isArray(value) || value === undefined ? null : value
}

function OutputBlockRenderer({ output, result }: { output: OutputBlock; result: Result }) {
  const { locale, currency } = getSite()

  if (output.type === 'stat') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">{output.label}</p>
        <p className="text-xl font-bold text-gray-900">
          {formatValue(asPrimitive(result[output.key]), output.format, output.decimals, locale, currency)}
        </p>
      </div>
    )
  }

  if (output.type === 'verdict') {
    const raw = result[output.key]
    const variant = raw === 'good' || raw === 'bad' || raw === 'neutral' ? raw : null
    if (!variant) return null

    const variantConfig = output.variants[variant]
    const label = typeof variantConfig.label === 'function' ? variantConfig.label(result) : variantConfig.label
    const style = {
      good: { bg: 'bg-green-50 border-green-200', icon: '🟢' },
      bad: { bg: 'bg-red-50 border-red-200', icon: '🔴' },
      neutral: { bg: 'bg-yellow-50 border-yellow-200', icon: '🟡' },
    }[variant]

    return (
      <div className={`rounded-2xl p-6 shadow-sm border ${style.bg}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{style.icon}</span>
          <span className="text-lg font-semibold text-gray-900">{label}</span>
        </div>
      </div>
    )
  }

  if (output.type === 'table') {
    const rows = result[output.rowsKey]
    if (!Array.isArray(rows) || rows.length === 0) return null

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {output.columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 font-medium text-gray-600">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50">
                {output.columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-900">
                    {formatValue(row[col.key] ?? null, col.format ?? 'text', col.decimals, locale, currency)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // note
  return <p className="text-sm text-gray-400 text-center">{output.text}</p>
}

function CtaButton({
  cta,
  result,
  slug,
}: {
  cta: NonNullable<ToolConfig['cta']>
  result: Result
  slug: string
}) {
  const label = typeof cta.label === 'function' ? cta.label(result) : cta.label
  const urgent = cta.urgent ? cta.urgent(result) : false

  return (
    <div className="text-center">
      <Link
        href={cta.href}
        onClick={() => trackToolToTool(slug, cta.href)}
        className={`inline-block px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
          urgent ? 'bg-primary text-white hover:opacity-90' : 'border border-primary text-primary hover:bg-primary/5'
        }`}
      >
        {label}
      </Link>
    </div>
  )
}
