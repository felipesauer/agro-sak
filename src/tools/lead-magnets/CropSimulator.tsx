import { useState } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { FUNRURAL_RATES } from '../../data/reference-data'

// ── Types ──

interface Inputs {
  productionCost: string
  area: string
  priceMin: string
  priceMax: string
  prodMin: string
  prodMax: string
  producerType: string
}

interface Scenario {
  label: string
  price: number
  productivity: number
  revenue: number
  totalCost: number
  profit: number
  profitPerHa: number
  roi: number
}

interface HeatCell {
  price: number
  productivity: number
  profit: number
}

interface Result {
  scenarios: Scenario[]
  heatmap: HeatCell[][]
  priceSteps: number[]
  prodSteps: number[]
  breakEvenProd: number
}

const INITIAL: Inputs = {
  productionCost: '',
  area: '',
  priceMin: '',
  priceMax: '',
  prodMin: '',
  prodMax: '',
  producerType: 'pf',
}

const PRODUCER_OPTIONS = [
  { value: 'pf', label: 'Pessoa Física' },
  { value: 'pj', label: 'Pessoa Jurídica' },
]

const STEPS = 7 // grid resolution

// ── Component ──

export default function CropSimulator() {
  const [inputs, setInputs] = useState<Inputs>(INITIAL)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  function updateInput(key: keyof Inputs, val: string) {
    setInputs((prev) => ({ ...prev, [key]: val }))
  }

  function run() {
    const cost = parseFloat(inputs.productionCost)
    const area = parseFloat(inputs.area)
    const priceMin = parseFloat(inputs.priceMin)
    const priceMax = parseFloat(inputs.priceMax)
    const prodMin = parseFloat(inputs.prodMin)
    const prodMax = parseFloat(inputs.prodMax)

    if (!cost || cost <= 0) { setError('Informe o custo de produção'); return }
    if (!area || area <= 0) { setError('Informe a área'); return }
    if (!priceMin || !priceMax || priceMin <= 0 || priceMax <= 0) { setError('Informe o range de preço'); return }
    if (!prodMin || !prodMax || prodMin <= 0 || prodMax <= 0) { setError('Informe o range de produtividade'); return }
    if (priceMin >= priceMax) { setError('Preço mínimo deve ser menor que o máximo'); return }
    if (prodMin >= prodMax) { setError('Produtividade mínima deve ser menor que a máxima'); return }

    const funrural = inputs.producerType === 'pf' ? FUNRURAL_RATES.PF : FUNRURAL_RATES.PJ
    const totalCost = cost * area

    // Generate steps
    const priceSteps: number[] = []
    const prodSteps: number[] = []
    for (let i = 0; i < STEPS; i++) {
      priceSteps.push(priceMin + (priceMax - priceMin) * (i / (STEPS - 1)))
      prodSteps.push(prodMin + (prodMax - prodMin) * (i / (STEPS - 1)))
    }

    // Heatmap grid (rows = productivity, cols = price)
    const heatmap: HeatCell[][] = prodSteps.map((prod) =>
      priceSteps.map((price) => {
        const grossRevenue = area * prod * price
        const funruralCost = grossRevenue * funrural
        const profit = grossRevenue - funruralCost - totalCost
        return { price, productivity: prod, profit }
      })
    )

    // Scenarios: pessimist, base, optimist
    const scenarioConfigs = [
      { label: 'Pessimista', priceIdx: 1, prodIdx: 1 },
      { label: 'Base', priceIdx: Math.floor(STEPS / 2), prodIdx: Math.floor(STEPS / 2) },
      { label: 'Otimista', priceIdx: STEPS - 2, prodIdx: STEPS - 2 },
    ]

    const scenarios: Scenario[] = scenarioConfigs.map(({ label, priceIdx, prodIdx }) => {
      const price = priceSteps[priceIdx]
      const prod = prodSteps[prodIdx]
      const grossRevenue = area * prod * price
      const funruralCost = grossRevenue * funrural
      const revenue = grossRevenue - funruralCost
      const profit = revenue - totalCost
      return {
        label,
        price,
        productivity: prod,
        revenue,
        totalCost,
        profit,
        profitPerHa: profit / area,
        roi: (profit / totalCost) * 100,
      }
    })

    // Break-even productivity at mid price
    const midPrice = priceSteps[Math.floor(STEPS / 2)]
    const breakEvenProd = cost / (midPrice * (1 - funrural))

    setError(null)
    setResult({ scenarios, heatmap, priceSteps, prodSteps, breakEvenProd })
  }

  function clear() {
    setInputs(INITIAL)
    setResult(null)
    setError(null)
  }

  // Color for profit cell
  function profitColor(profit: number, maxAbs: number): string {
    if (maxAbs === 0) return 'bg-gray-100'
    const ratio = Math.min(Math.abs(profit) / maxAbs, 1)
    if (profit > 0) {
      if (ratio > 0.6) return 'bg-green-600 text-white'
      if (ratio > 0.3) return 'bg-green-400 text-white'
      return 'bg-green-200'
    }
    if (ratio > 0.6) return 'bg-red-600 text-white'
    if (ratio > 0.3) return 'bg-red-400 text-white'
    return 'bg-red-200'
  }

  // Get max absolute profit for color scaling
  const maxAbsProfit = result
    ? Math.max(...result.heatmap.flat().map((c) => Math.abs(c.profit)), 1)
    : 1

  return (
    <CalculatorLayout
      title="Simulador de Safra"
      description="Cruza preço de mercado × produtividade × custo de produção para gerar análise de viabilidade com múltiplos cenários."
      about="Visualize todos os cenários de lucro em um heatmap que cruza preço de venda com produtividade. Identifique rapidamente quais combinações geram lucro e quais significam prejuízo."
      methodology="Matriz 7×7 de preço × produtividade. Lucro = (Preço × Produtividade × Peso saca) - (Custo/ha × Área) - Funrural. Cores: verde (lucro) → vermelho (prejuízo)."
      result={
        result && (
          <div className="space-y-6">
            {/* Scenarios */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Cenários</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {result.scenarios.map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-lg border p-3 ${
                      s.profit >= 0 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-600 uppercase">{s.label}</p>
                    <p className="text-lg font-bold mt-1">
                      {formatCurrency(s.profit)}
                    </p>
                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                      <p>Preço: {formatCurrency(s.price)}/sc</p>
                      <p>Prod: {formatNumber(s.productivity, 1)} sc/ha</p>
                      <p>ROI: {formatNumber(s.roi, 1)}%</p>
                      <p>Lucro/ha: {formatCurrency(s.profitPerHa)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Break-even */}
            <AlertBanner
              variant="info"
              message={`Ponto de equilíbrio: ${formatNumber(result.breakEvenProd, 1)} sc/ha ao preço base de ${formatCurrency(result.priceSteps[Math.floor(STEPS / 2)])}/sc`}
            />

            {/* Heatmap */}
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Heatmap: Lucro por combinação Preço × Produtividade
              </h3>
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse w-full min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="p-1 text-left border border-gray-300 bg-gray-100">
                        Prod. \ Preço
                      </th>
                      {result.priceSteps.map((p) => (
                        <th key={p} className="p-1 text-center border border-gray-300 bg-gray-100">
                          {formatCurrency(p)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.heatmap.map((row, ri) => (
                      <tr key={ri}>
                        <td className="p-1 font-medium border border-gray-300 bg-gray-50 whitespace-nowrap">
                          {formatNumber(result.prodSteps[ri], 1)} sc/ha
                        </td>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className={`p-1 text-center border border-gray-300 font-medium ${profitColor(cell.profit, maxAbsProfit)}`}
                          >
                            {formatCurrency(cell.profit / 1000)}k
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Valores em milhares (k). Verde = lucro, Vermelho = prejuízo.
              </p>
            </div>
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Custo de produção"
          prefix="R$" unit="R$/ha"
          value={inputs.productionCost}
          onChange={(v) => updateInput('productionCost', v as string)}
          placeholder="ex: 3500"
          min="0"
          required
        />
        <InputField
          label="Área total"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v as string)}
          placeholder="ex: 500"
          min="0"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Preço mínimo"
          prefix="R$" unit="R$/sc"
          value={inputs.priceMin}
          onChange={(v) => updateInput('priceMin', v as string)}
          placeholder="ex: 90"
          min="0"
          required
        />
        <InputField
          label="Preço máximo"
          prefix="R$" unit="R$/sc"
          value={inputs.priceMax}
          onChange={(v) => updateInput('priceMax', v as string)}
          placeholder="ex: 140"
          min="0"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Produtividade mínima"
          unit="sc/ha"
          value={inputs.prodMin}
          onChange={(v) => updateInput('prodMin', v as string)}
          placeholder="ex: 40"
          min="0"
          required
        />
        <InputField
          label="Produtividade máxima"
          unit="sc/ha"
          value={inputs.prodMax}
          onChange={(v) => updateInput('prodMax', v as string)}
          placeholder="ex: 70"
          min="0"
          required
        />
      </div>

      <SelectField
        label="Tipo de produtor (Funrural)"
        options={PRODUCER_OPTIONS}
        value={inputs.producerType}
        onChange={(v) => updateInput('producerType', v)}
      />

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
