import { useState } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatCurrency, formatNumber } from '../../utils/formatters'

// ── Types ──

interface CropEntry {
  id: number
  name: string
  productivity: string
  price: string
  productionCost: string
  enabled: boolean
}

interface CropResult {
  name: string
  revenuePerHa: number
  costPerHa: number
  profitPerHa: number
  roi: number
  margin: number
}

const DEFAULTS: CropEntry[] = [
  { id: 1, name: 'Soja', productivity: '55', price: '115', productionCost: '3200', enabled: true },
  { id: 2, name: 'Milho', productivity: '100', price: '50', productionCost: '2800', enabled: true },
  { id: 3, name: 'Algodão (@)', productivity: '280', price: '120', productionCost: '8500', enabled: false },
]

// ── Component ──

export default function CropComparer() {
  const [crops, setCrops] = useState<CropEntry[]>(DEFAULTS)
  const [results, setResults] = useState<CropResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function updateCrop(id: number, key: keyof CropEntry, val: string | boolean) {
    setCrops((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: val } : c)))
  }

  function addCrop() {
    if (crops.length >= 6) return
    setCrops((prev) => [...prev, { id: prev.length + 1, name: `Cultura ${prev.length + 1}`, productivity: '', price: '', productionCost: '', enabled: true }])
  }

  function run() {
    const enabled = crops.filter((c) => c.enabled)
    if (enabled.length < 2) { setError('Selecione ao menos 2 culturas para comparar'); return }

    const valid = enabled.filter((c) => {
      const prod = parseFloat(c.productivity)
      const price = parseFloat(c.price)
      const cost = parseFloat(c.productionCost)
      return prod > 0 && price > 0 && cost > 0
    })

    if (valid.length < 2) { setError('Preencha produtividade, preço e custo de ao menos 2 culturas'); return }

    const results: CropResult[] = valid.map((c) => {
      const prod = parseFloat(c.productivity)
      const price = parseFloat(c.price)
      const cost = parseFloat(c.productionCost)
      const revenue = prod * price
      const profit = revenue - cost
      const roi = (profit / cost) * 100
      const margin = (profit / revenue) * 100
      return { name: c.name, revenuePerHa: revenue, costPerHa: cost, profitPerHa: profit, roi, margin }
    })

    results.sort((a, b) => b.profitPerHa - a.profitPerHa)
    setError(null)
    setResults(results)
  }

  function clear() {
    setCrops(DEFAULTS)
    setResults(null)
    setError(null)
  }

  const maxRevenue = results ? Math.max(...results.map((r) => r.revenuePerHa)) : 1

  return (
    <CalculatorLayout
      title="Comparador de Culturas"
      description="Compare a rentabilidade esperada de diferentes culturas na mesma área. Ranking visual para apoiar sua decisão."
      about="Compare a rentabilidade de múltiplas culturas lado a lado. Insira produtividade esperada, preço de venda e custo de produção para cada cultura e veja qual oferece maior lucro por hectare."
      methodology="Receita bruta = Produtividade × Preço × Peso da saca. Lucro = Receita bruta - Custo total. Margem = Lucro / Receita × 100. Visualização comparativa em barras."
      result={
        results && (
          <div className="space-y-4">
            {/* Ranking */}
            <h3 className="text-sm font-semibold">Ranking de Rentabilidade (R$/ha)</h3>
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={r.name} className="rounded-lg border p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">
                      {`${i + 1}º`} {r.name}
                    </span>
                    <span className={`font-bold text-sm ${r.profitPerHa >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(r.profitPerHa)}/ha
                    </span>
                  </div>
                  {/* Stacked bar: cost + profit */}
                  <div className="flex h-5 rounded overflow-hidden text-xs">
                    <div
                      className="bg-red-400 flex items-center justify-center text-white"
                      style={{ width: `${(r.costPerHa / maxRevenue) * 100}%` }}
                    >
                      {r.costPerHa > maxRevenue * 0.15 && 'Custo'}
                    </div>
                    {r.profitPerHa > 0 && (
                      <div
                        className="bg-green-500 flex items-center justify-center text-white"
                        style={{ width: `${(r.profitPerHa / maxRevenue) * 100}%` }}
                      >
                        {r.profitPerHa > maxRevenue * 0.1 && 'Lucro'}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>ROI: {formatNumber(r.roi, 1)}%</span>
                    <span>Margem: {formatNumber(r.margin, 1)}%</span>
                    <span>Receita: {formatCurrency(r.revenuePerHa)}/ha</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <ComparisonTable
              columns={[
                { key: 'name', label: 'Cultura' },
                { key: 'revenuePerHa', label: 'Receita/ha', align: 'right', format: (v) => formatCurrency(v as number) },
                { key: 'costPerHa', label: 'Custo/ha', align: 'right', format: (v) => formatCurrency(v as number) },
                {
                  key: 'profitPerHa',
                  label: 'Lucro/ha',
                  align: 'right',
                  format: (v) => formatCurrency(v as number),
                  cellClassName: (v) => `font-bold ${(v as number) >= 0 ? 'text-green-700' : 'text-red-700'}`,
                },
                { key: 'roi', label: 'ROI', align: 'right', format: (v) => `${formatNumber(v as number, 1)}%` },
                { key: 'margin', label: 'Margem', align: 'right', format: (v) => `${formatNumber(v as number, 1)}%` },
              ]}
              rows={results as unknown as Record<string, unknown>[]}
              rowKey={'name' as never}
            />

            {results.length >= 2 && (
              <AlertBanner
                variant="info"
                message={`Para a segunda opção (${results[1].name}) superar a primeira (${results[0].name}), seria necessário um aumento de ${formatCurrency(results[0].profitPerHa - results[1].profitPerHa)}/ha em lucro.`}
              />
            )}
          </div>
        )
      }
    >
      <div className="space-y-4">
        {crops.map((c) => (
          <div key={c.id} className={`rounded-lg border p-3 space-y-3 ${!c.enabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={c.enabled}
                  onChange={(e) => updateCrop(c.id, 'enabled', e.target.checked)}
                  className="accent-agro-600"
                />
                Incluir
              </label>
              <div className="flex-1">
                <InputField label="" value={c.name} onChange={(v) => updateCrop(c.id, 'name', v as string)} placeholder="Nome da cultura" />
              </div>
            </div>
            {c.enabled && (
              <div className="grid gap-3 sm:grid-cols-3">
                <InputField label="Produtividade" unit="sc/ha" value={c.productivity} onChange={(v) => updateCrop(c.id, 'productivity', v as string)} min="0" />
                <InputField label="Preço de venda" prefix="R$" unit="R$/sc" value={c.price} onChange={(v) => updateCrop(c.id, 'price', v as string)} min="0" />
                <InputField label="Custo de produção" prefix="R$" unit="R$/ha" value={c.productionCost} onChange={(v) => updateCrop(c.id, 'productionCost', v as string)} min="0" />
              </div>
            )}
          </div>
        ))}
      </div>

      {crops.length < 6 && (
        <button
          type="button"
          onClick={addCrop}
          className="text-sm text-agro-600 hover:text-agro-800 font-medium"
        >
          + Adicionar cultura
        </button>
      )}

      {error && <AlertBanner variant="error" message={error} />}

      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
