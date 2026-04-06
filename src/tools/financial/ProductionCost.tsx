import { useState, useMemo } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'

// ── Types ──

interface CostGroup {
  label: string
  items: { key: string; label: string; default: string }[]
}

interface Inputs {
  [key: string]: string
}

interface Result {
  groupTotals: { label: string; total: number; percent: number }[]
  totalCostHa: number
  costPerSc: number
  breakEvenSc: number | null
  breakEvenPrice: number | null
}

// ── Cost structure ──

const COST_GROUPS: CostGroup[] = [
  {
    label: 'Insumos',
    items: [
      { key: 'seeds', label: 'Sementes', default: '320' },
      { key: 'fertPlanting', label: 'Fertilizantes (plantio)', default: '680' },
      { key: 'fertCover', label: 'Fertilizantes (cobertura)', default: '420' },
      { key: 'herbicides', label: 'Herbicidas', default: '185' },
      { key: 'fungicides', label: 'Fungicidas', default: '240' },
      { key: 'insecticides', label: 'Inseticidas', default: '90' },
      { key: 'inoculant', label: 'Inoculante / Co-inoc.', default: '25' },
      { key: 'micro', label: 'Micronutrientes', default: '35' },
    ],
  },
  {
    label: 'Operações',
    items: [
      { key: 'soilPrep', label: 'Preparo do solo', default: '120' },
      { key: 'planting', label: 'Plantio', default: '85' },
      { key: 'spraying', label: 'Pulverizações', default: '180' },
      { key: 'harvesting', label: 'Colheita', default: '145' },
      { key: 'internalTransport', label: 'Transporte interno', default: '40' },
    ],
  },
  {
    label: 'Custos Fixos',
    items: [
      { key: 'lease', label: 'Arrendamento', default: '420' },
      { key: 'depreciation', label: 'Depreciação de máquinas', default: '180' },
      { key: 'labor', label: 'Mão de obra fixa', default: '95' },
      { key: 'admin', label: 'Administração / gestão', default: '50' },
      { key: 'insurance', label: 'Seguro rural', default: '30' },
      { key: 'ater', label: 'Assistência técnica', default: '20' },
    ],
  },
  {
    label: 'Pós-colheita',
    items: [
      { key: 'freight', label: 'Frete', default: '95' },
      { key: 'storage', label: 'Armazenagem', default: '45' },
      { key: 'drying', label: 'Secagem', default: '30' },
    ],
  },
]

function buildInitial(): Inputs {
  const inputs: Inputs = {
    expectedYield: '65',
    sacPrice: '115',
  }
  for (const group of COST_GROUPS) {
    for (const item of group.items) {
      inputs[item.key] = item.default
    }
  }
  return inputs
}

const INITIAL = buildInitial()

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const expectedYield = parseFloat(inputs.expectedYield) || 0
  const sacPrice = parseFloat(inputs.sacPrice) || 0

  let totalCostHa = 0
  const groupTotals: { label: string; total: number; percent: number }[] = []

  for (const group of COST_GROUPS) {
    let groupTotal = 0
    for (const item of group.items) {
      groupTotal += parseFloat(inputs[item.key]) || 0
    }
    totalCostHa += groupTotal
    groupTotals.push({ label: group.label, total: groupTotal, percent: 0 })
  }

  // Calculate percentages
  for (const g of groupTotals) {
    g.percent = totalCostHa > 0 ? (g.total / totalCostHa) * 100 : 0
  }

  const costPerSc = expectedYield > 0 ? totalCostHa / expectedYield : 0
  const breakEvenSc = sacPrice > 0 ? totalCostHa / sacPrice : null
  const breakEvenPrice = expectedYield > 0 ? totalCostHa / expectedYield : null

  return { groupTotals, totalCostHa, costPerSc, breakEvenSc, breakEvenPrice }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.expectedYield || parseFloat(inputs.expectedYield) <= 0)
    return 'Informe a produtividade esperada'
  return null
}

// ── Component ──

export default function ProductionCost() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Insumos: true,
    Operações: false,
    'Custos Fixos': false,
    'Pós-colheita': false,
  })

  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  // Cost bar widths for visual breakdown
  const maxGroupTotal = useMemo(
    () => (result ? Math.max(...result.groupTotals.map((g) => g.total)) : 0),
    [result],
  )

  return (
    <CalculatorLayout
      title="Custo de Produção"
      description="Some todos os custos da safra e descubra o custo por hectare, por saca e o ponto de equilíbrio."
      about="Some todos os custos da safra — insumos, operações, custos fixos e pós-colheita — e descubra o custo por hectare e por saca. Identifique o ponto de equilíbrio da produtividade."
      methodology="Custo total = Σ(Insumos + Operações + Custos fixos + Pós-colheita). Custo por saca = Custo total / Produtividade. Break-even = Custo total / Preço da saca."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Custo total"
                value={formatCurrency(result.totalCostHa, 0)}
                unit="/ha"
                highlight
                variant="warning"
              />
              <ResultCard
                label="Custo por saca"
                value={formatCurrency(result.costPerSc)}
                unit="/sc"
                highlight
                variant="warning"
              />
            </div>

            {result.breakEvenSc !== null && result.breakEvenPrice !== null && (
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard
                  label="Ponto de equilíbrio"
                  value={formatNumber(result.breakEvenSc, 1)}
                  unit="sc/ha"
                  variant="default"
                >
                  <p className="text-xs text-gray-500 mt-1">
                    Produtividade mínima para pagar os custos
                  </p>
                </ResultCard>
                <ResultCard
                  label="Preço de equilíbrio"
                  value={formatCurrency(result.breakEvenPrice)}
                  unit="/sc"
                  variant="default"
                >
                  <p className="text-xs text-gray-500 mt-1">
                    Preço mínimo de venda
                  </p>
                </ResultCard>
              </div>
            )}

            {/* Cost breakdown bars */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Composição dos custos
              </p>
              {result.groupTotals.map((g) => (
                <div key={g.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{g.label}</span>
                    <span className="text-gray-500">
                      {formatCurrency(g.total, 0)} ({formatNumber(g.percent, 1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-agro-600 h-2 rounded-full transition-all"
                      style={{ width: `${maxGroupTotal > 0 ? (g.total / maxGroupTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Produtividade esperada"
          unit="sc/ha"
          value={inputs.expectedYield}
          onChange={(v) => updateInput('expectedYield', v)}
          placeholder="ex: 65"
          required
        />
        <InputField
          label="Preço da saca (referência)"
          prefix="R$" unit="R$/sc"
          value={inputs.sacPrice}
          onChange={(v) => updateInput('sacPrice', v)}
          placeholder="ex: 115"
          step="0.01"
          hint="Para calcular o ponto de equilíbrio"
        />
      </div>

      {COST_GROUPS.map((group) => (
        <div key={group.label} className="border border-gray-200 rounded-lg overflow-hidden mt-4">
          <button
            type="button"
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left cursor-pointer"
            onClick={() => toggleGroup(group.label)}
          >
            <span className="font-medium text-gray-700">{group.label} (R$/ha)</span>
            <span className="text-gray-400 text-sm">
              {expandedGroups[group.label] ? '▲' : '▼'}
            </span>
          </button>
          {expandedGroups[group.label] && (
            <div className="p-4 grid gap-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <InputField
                  key={item.key}
                  label={item.label}
                  prefix="R$" unit="R$/ha"
                  value={inputs[item.key]}
                  onChange={(v) => updateInput(item.key, v)}
                  placeholder="0"
                  step="1"
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
