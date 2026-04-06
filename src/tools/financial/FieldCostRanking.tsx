import { useState } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'

// ── Types ──

interface FieldEntry {
  id: number
  name: string
  area: string
  productivity: string
  inputCost: string
  operationCost: string
  leaseCost: string
  otherCost: string
}

interface FieldResult {
  name: string
  area: number
  totalCost: number
  costPerHa: number
  costPerSc: number
  revenuePerHa: number
  profitPerHa: number
  profit: number
}

const PRICE_PER_SC = 115 // default soy price
const MAX_FIELDS = 20

function emptyField(id: number): FieldEntry {
  return { id, name: `Talhão ${id}`, area: '', productivity: '', inputCost: '', operationCost: '', leaseCost: '', otherCost: '' }
}

// ── Component ──

export default function FieldCostRanking() {
  const [fields, setFields] = useState<FieldEntry[]>([emptyField(1), emptyField(2)])
  const [pricePerSc, setPricePerSc] = useState<string>('115')
  const [results, setResults] = useState<FieldResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function updateField(id: number, key: keyof FieldEntry, val: string) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: val } : f))
    )
  }

  function addField() {
    if (fields.length >= MAX_FIELDS) return
    setFields((prev) => [...prev, emptyField(prev.length + 1)])
  }

  function removeField(id: number) {
    if (fields.length <= 1) return
    setFields((prev) => prev.filter((f) => f.id !== id))
  }

  function run() {
    const price = parseFloat(pricePerSc) || PRICE_PER_SC
    const valid = fields.filter((f) => parseFloat(f.area) > 0 && parseFloat(f.productivity) > 0)
    if (valid.length === 0) { setError('Informe ao menos 1 talhão com área e produtividade'); return }

    const results: FieldResult[] = valid.map((f) => {
      const area = parseFloat(f.area)
      const prod = parseFloat(f.productivity)
      const ic = parseFloat(f.inputCost) || 0
      const oc = parseFloat(f.operationCost) || 0
      const lc = parseFloat(f.leaseCost) || 0
      const otc = parseFloat(f.otherCost) || 0
      const costPerHa = ic + oc + lc + otc
      const totalCost = costPerHa * area
      const costPerSc = prod > 0 ? costPerHa / prod : 0
      const revenuePerHa = prod * price
      const profitPerHa = revenuePerHa - costPerHa
      const profit = profitPerHa * area
      return { name: f.name, area, totalCost, costPerHa, costPerSc, revenuePerHa, profitPerHa, profit }
    })

    results.sort((a, b) => b.profitPerHa - a.profitPerHa)
    setError(null)
    setResults(results)
  }

  function clear() {
    setFields([emptyField(1), emptyField(2)])
    setPricePerSc('115')
    setResults(null)
    setError(null)
  }

  return (
    <CalculatorLayout
      title="Custo por Talhão com Ranking"
      description="Cadastre cada talhão com seus custos e produtividade para gerar um ranking de rentabilidade."
      about="Compare a rentabilidade de diferentes talhões da fazenda. Identifique quais áreas são mais e menos lucrativas para direcionar investimentos e manejo diferenciado."
      methodology="Lucro por talhão = (Produtividade × Preço - Custo) × Área. Ranking ordenado por lucro/ha, com indicadores visuais de desempenho relativo."
      result={
        results && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Ranking de Rentabilidade</h3>
            <div className="overflow-x-auto">
              <table className="text-sm w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left border">#</th>
                    <th className="p-2 text-left border">Talhão</th>
                    <th className="p-2 text-right border">Área (ha)</th>
                    <th className="p-2 text-right border">Custo/ha</th>
                    <th className="p-2 text-right border">Custo/sc</th>
                    <th className="p-2 text-right border">Lucro/ha</th>
                    <th className="p-2 text-right border">Lucro total</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className={r.profitPerHa < 0 ? 'bg-red-50' : ''}>
                      <td className="p-2 border font-medium">{i + 1}</td>
                      <td className="p-2 border">{r.name}</td>
                      <td className="p-2 border text-right">{formatNumber(r.area, 1)}</td>
                      <td className="p-2 border text-right">{formatCurrency(r.costPerHa)}</td>
                      <td className="p-2 border text-right">{formatCurrency(r.costPerSc)}</td>
                      <td className={`p-2 border text-right font-bold ${r.profitPerHa >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(r.profitPerHa)}
                      </td>
                      <td className={`p-2 border text-right ${r.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(r.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {results.some((r) => r.profitPerHa < 0) && (
              <AlertBanner
                variant="warning"
                message="Talhões em vermelho operam com prejuízo. Avalie intensificação, arrendamento ou mudança de cultura."
              />
            )}
          </div>
        )
      }
    >
      <InputField
        label="Preço de venda"
        prefix="R$" unit="R$/sc"
        value={pricePerSc}
        onChange={(v) => setPricePerSc(v as string)}
        placeholder="ex: 115"
        min="0"
      />

      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.id} className="rounded-lg border border-gray-200 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <InputField
                label="Nome do talhão"
                value={f.name}
                onChange={(v) => updateField(f.id, 'name', v as string)}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField(f.id)}
                  className="text-red-500 text-sm hover:underline ml-3 mt-5"
                >
                  Remover
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <InputField label="Área" unit="ha" value={f.area} onChange={(v) => updateField(f.id, 'area', v as string)} min="0" required />
              <InputField label="Produtividade" unit="sc/ha" value={f.productivity} onChange={(v) => updateField(f.id, 'productivity', v as string)} min="0" required />
              <InputField label="Custo insumos" prefix="R$" unit="R$/ha" value={f.inputCost} onChange={(v) => updateField(f.id, 'inputCost', v as string)} min="0" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <InputField label="Custo operações" prefix="R$" unit="R$/ha" value={f.operationCost} onChange={(v) => updateField(f.id, 'operationCost', v as string)} min="0" />
              <InputField label="Arrendamento" prefix="R$" unit="R$/ha" value={f.leaseCost} onChange={(v) => updateField(f.id, 'leaseCost', v as string)} min="0" />
              <InputField label="Outros custos" prefix="R$" unit="R$/ha" value={f.otherCost} onChange={(v) => updateField(f.id, 'otherCost', v as string)} min="0" />
            </div>
          </div>
        ))}
      </div>

      {fields.length < MAX_FIELDS && (
        <button
          type="button"
          onClick={addField}
          className="text-sm text-agro-600 hover:text-agro-800 font-medium"
        >
          + Adicionar talhão
        </button>
      )}

      {error && <AlertBanner variant="error" message={error} />}

      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
