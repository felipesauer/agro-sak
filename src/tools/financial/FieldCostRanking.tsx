import { useState } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import DataFreshness from '../../components/ui/DataFreshness'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { useCropPrice } from '../../db/hooks'

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
  id: number
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
  const soyPrice = useCropPrice('soybean')
  const defaultPrice = soyPrice?.avg ?? PRICE_PER_SC
  const [fields, setFields] = useState<FieldEntry[]>([emptyField(1), emptyField(2)])
  const [pricePerSc, setPricePerSc] = useState<string>(String(defaultPrice))
  const [results, setResults] = useState<FieldResult[] | null>(null)
  const [excludedCount, setExcludedCount] = useState(0)
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
    const excluded = fields.filter((f) => (parseFloat(f.area) > 0 || parseFloat(f.productivity) > 0) && !(parseFloat(f.area) > 0 && parseFloat(f.productivity) > 0))
    if (valid.length === 0) { setError('Informe ao menos 1 talhão com área e produtividade'); return }
    setExcludedCount(excluded.length)

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
      return { id: f.id, name: f.name, area, totalCost, costPerHa, costPerSc, revenuePerHa, profitPerHa, profit }
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
            <ComparisonTable
              columns={[
                { key: 'rank', label: '#' },
                { key: 'name', label: 'Talhão' },
                { key: 'area', label: 'Área', unit: 'ha', align: 'right', format: (v) => formatNumber(v as number, 1) },
                { key: 'costPerHa', label: 'Custo/ha', align: 'right', format: (v) => formatCurrency(v as number) },
                { key: 'costPerSc', label: 'Custo/sc', align: 'right', format: (v) => formatCurrency(v as number) },
                {
                  key: 'profitPerHa',
                  label: 'Lucro/ha',
                  align: 'right',
                  format: (v) => formatCurrency(v as number),
                  cellClassName: (v) => `font-bold ${(v as number) >= 0 ? 'text-green-700' : 'text-red-700'}`,
                },
                {
                  key: 'profit',
                  label: 'Lucro total',
                  align: 'right',
                  format: (v) => formatCurrency(v as number),
                  cellClassName: (v) => (v as number) >= 0 ? 'text-green-700' : 'text-red-700',
                },
              ]}
              rows={results.map((r, i) => ({ ...r, rank: i + 1 }))}
              rowKey="id"
              rowClassName={(row) => (row.profitPerHa as number) < 0 ? 'bg-red-50' : ''}
            />

            {results.some((r) => r.profitPerHa < 0) && (
              <AlertBanner
                variant="warning"
                message="Talhões em vermelho operam com prejuízo. Avalie intensificação, arrendamento ou mudança de cultura."
              />
            )}

            {excludedCount > 0 && (
              <AlertBanner
                variant="info"
                message={`${excludedCount} talhão(ões) excluído(s) do ranking por falta de área ou produtividade.`}
              />
            )}
          </div>
        )
      }
    >
      <InputField
        label="Preço de venda"
        prefix="R$" mask="currency" unit="R$/sc"
        value={pricePerSc}
        onChange={(v) => setPricePerSc(v as string)}
        placeholder="ex: 115"
        min="0"
        hint="Preço de referência para calcular rentabilidade"
      />

      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.id} className="rounded-lg border border-gray-200 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <InputField
                label="Nome do talhão"
                value={f.name}
                onChange={(v) => updateField(f.id, 'name', v as string)}
                hint="Identificação do talhão na fazenda"
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
              <InputField label="Área" unit="ha" value={f.area} onChange={(v) => updateField(f.id, 'area', v as string)} min="0" required hint="Área do talhão em hectares" />
              <InputField label="Produtividade" unit="sc/ha" value={f.productivity} onChange={(v) => updateField(f.id, 'productivity', v as string)} min="0" required hint="Produtividade estimada do talhão" />
              <InputField label="Custo insumos" prefix="R$" mask="currency" unit="R$/ha" value={f.inputCost} onChange={(v) => updateField(f.id, 'inputCost', v as string)} min="0" hint="Sementes, fertilizantes e defensivos" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <InputField label="Custo operações" prefix="R$" mask="currency" unit="R$/ha" value={f.operationCost} onChange={(v) => updateField(f.id, 'operationCost', v as string)} min="0" hint="Plantio, pulverização e colheita" />
              <InputField label="Arrendamento" prefix="R$" mask="currency" unit="R$/ha" value={f.leaseCost} onChange={(v) => updateField(f.id, 'leaseCost', v as string)} min="0" hint="Custo do arrendamento por hectare" />
              <InputField label="Outros custos" prefix="R$" mask="currency" unit="R$/ha" value={f.otherCost} onChange={(v) => updateField(f.id, 'otherCost', v as string)} min="0" hint="Custos fixos, administrativos e outros" />
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

      <DataFreshness table="cropPrices" label="Preços" />
      <ActionButtons onCalculate={run} onClear={clear} disabled={fields.filter(f => f.area && f.productivity).length < 1} />
    </CalculatorLayout>
  )
}
