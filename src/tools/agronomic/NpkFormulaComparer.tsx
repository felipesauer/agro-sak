import { useState } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatNumber, formatCurrency } from '../../utils/formatters'

// ── Types ──

interface FormulaEntry {
  id: string
  n: string
  p: string
  k: string
  price: string
  supplier: string
}

interface FormulaResult {
  formula: string
  supplier: string
  totalPercent: number
  costPerKgN: number | null
  costPerKgP: number | null
  costPerKgK: number | null
  costPerPoint: number
  isBest: boolean
}

let _entryId = 0
function emptyEntry(): FormulaEntry {
  return { id: `fe-${++_entryId}`, n: '', p: '', k: '', price: '', supplier: '' }
}

// ── Component ──

export default function NpkFormulaComparer() {
  const [entries, setEntries] = useState<FormulaEntry[]>([
    { id: `fe-${++_entryId}`, n: '8', p: '28', k: '16', price: '145', supplier: '' },
    emptyEntry(),
  ])
  const [results, setResults] = useState<FormulaResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateEntry = (idx: number, key: keyof FormulaEntry, value: string) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [key]: value } : e)))
  }

  const addEntry = () => {
    if (entries.length < 4) setEntries((prev) => [...prev, emptyEntry()])
  }

  const removeEntry = (idx: number) => {
    if (entries.length > 2) setEntries((prev) => prev.filter((_, i) => i !== idx))
  }

  const calculate = () => {
    setError(null)
    const valid = entries.filter(
      (e) => e.n && e.p && e.k && e.price && parseFloat(e.price) > 0,
    )
    if (valid.length < 2) {
      setError('Preencha pelo menos 2 formulações com preço para comparar')
      setResults(null)
      return
    }

    const parsed: FormulaResult[] = valid.map((e) => {
      const n = parseFloat(e.n) || 0
      const p = parseFloat(e.p) || 0
      const k = parseFloat(e.k) || 0
      const price = parseFloat(e.price)
      const totalPercent = n + p + k
      const pricePerKg = price / 50 // 50kg bag

      return {
        formula: `${String(n).padStart(2, '0')}-${String(p).padStart(2, '0')}-${String(k).padStart(2, '0')}`,
        supplier: e.supplier || '—',
        totalPercent,
        costPerKgN: n > 0 ? pricePerKg / (n / 100) : null,
        costPerKgP: p > 0 ? pricePerKg / (p / 100) : null,
        costPerKgK: k > 0 ? pricePerKg / (k / 100) : null,
        costPerPoint: price / (50 * (totalPercent / 100)),
        isBest: false,
      }
    })

    // Mark best cost per point
    let minCost = Infinity
    let bestIdx = 0
    parsed.forEach((f, i) => {
      if (f.costPerPoint < minCost) {
        minCost = f.costPerPoint
        bestIdx = i
      }
    })
    parsed[bestIdx].isBest = true

    setResults(parsed)
  }

  const clear = () => {
    setEntries([emptyEntry(), emptyEntry()])
    setResults(null)
    setError(null)
  }

  return (
    <CalculatorLayout
      title="Conversor de Formulação NPK"
      description="Compare formulações de adubo pelo custo por ponto de nutriente e descubra o melhor custo-benefício."
      about="Compare diferentes formulações de adubo NPK pelo custo por ponto de nutriente (R$/kg de N, P₂O₅ ou K₂O). Identifique qual fornecedor ou formulação oferece o melhor custo-benefício."
      methodology="Custo por ponto = Preço da tonelada / (% do nutriente na fórmula × 10). Compara até 4 formulações simultaneamente."
      result={
        results && (
          <div className="space-y-4">
            <ComparisonTable
              columns={[
                {
                  key: 'formula',
                  label: 'Fórmula',
                  format: (v, row) => (
                    <>{v as string}{(row as Record<string, unknown>).isBest && <span className="ml-1 text-agro-700">★</span>}</>
                  ),
                },
                { key: 'supplier', label: 'Fornecedor' },
                { key: 'totalPercent', label: 'Conc. (%)', format: (v) => `${formatNumber(v as number, 0)}%` },
                { key: 'costPerKgN', label: 'R$/kg N', format: (v) => (v as number) ? formatCurrency(v as number) : '—' },
                { key: 'costPerKgP', label: 'R$/kg P₂O₅', format: (v) => (v as number) ? formatCurrency(v as number) : '—' },
                { key: 'costPerKgK', label: 'R$/kg K₂O', format: (v) => (v as number) ? formatCurrency(v as number) : '—' },
                { key: 'costPerPoint', label: 'R$/ponto', format: (v) => formatCurrency(v as number) },
              ]}
              rows={results}
              rowClassName={(row) => (row as Record<string, unknown>).isBest ? 'bg-agro-100 font-semibold' : ''}
            />

            {results.some((f) => f.totalPercent < 20) && (
              <AlertBanner
                variant="warning"
                message="Uma ou mais formulações têm concentração total abaixo de 20% (muita carga, pouco nutriente)."
              />
            )}
          </div>
        )
      }
    >
      {entries.map((entry, idx) => (
        <div key={entry.id} className="border border-agro-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-agro-700">Formulação {idx + 1}</span>
            {entries.length > 2 && (
              <button
                type="button"
                onClick={() => removeEntry(idx)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remover
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InputField
              label="N"
              unit="%"
              value={entry.n}
              onChange={(v) => updateEntry(idx, 'n', v)}
              placeholder="8"
              min="0"
              max="50"
              hint="Teor de nitrogênio da fórmula"
            />
            <InputField
              label="P₂O₅"
              unit="%"
              value={entry.p}
              onChange={(v) => updateEntry(idx, 'p', v)}
              placeholder="28"
              min="0"
              max="60"
              hint="Teor de fósforo da fórmula"
            />
            <InputField
              label="K₂O"
              unit="%"
              value={entry.k}
              onChange={(v) => updateEntry(idx, 'k', v)}
              placeholder="16"
              min="0"
              max="70"
              hint="Teor de potássio da fórmula"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InputField
              label="Preço por saco 50kg"
              prefix="R$" unit="R$"
              value={entry.price}
              onChange={(v) => updateEntry(idx, 'price', v)}
              placeholder="145"
              min="0"
              hint="Preço pago no fornecedor pelo saco de 50 kg"
            />
            <InputField
              label="Fornecedor (opcional)"
              value={entry.supplier}
              onChange={(v) => updateEntry(idx, 'supplier', v)}
              placeholder="ex: Cooperativa X"
              hint="Identificação para facilitar a comparação"
            />
          </div>
        </div>
      ))}

      {entries.length < 4 && (
        <button
          type="button"
          onClick={addEntry}
          className="text-sm text-agro-600 hover:text-agro-800 font-medium"
        >
          + Adicionar formulação
        </button>
      )}

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={calculate} onClear={clear} disabled={entries.filter(e => e.n && e.p && e.k && e.price).length < 2} />
    </CalculatorLayout>
  )
}
