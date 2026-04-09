import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { FUNRURAL_RATES } from '../../data/reference-data'
import { calculateCropSimulator, validateCropSimulator, type CropSimulatorResult } from '../../core/financial/crop-simulator'

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

// ── Calculation ──

function buildCoreInput(inputs: Inputs) {
  return {
    productionCost: parseFloat(inputs.productionCost),
    areaHa: parseFloat(inputs.area),
    priceMin: parseFloat(inputs.priceMin),
    priceMax: parseFloat(inputs.priceMax),
    prodMin: parseFloat(inputs.prodMin),
    prodMax: parseFloat(inputs.prodMax),
    funruralPercent: inputs.producerType === 'pf' ? FUNRURAL_RATES.PF.total : FUNRURAL_RATES.PJ.total,
  }
}

function validate(inputs: Inputs): string | null {
  return validateCropSimulator(buildCoreInput(inputs))
}

function calculateResult(inputs: Inputs): CropSimulatorResult | null {
  return calculateCropSimulator(buildCoreInput(inputs))
}

// ── Component ──

export default function CropSimulator() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, CropSimulatorResult>({ initialInputs: INITIAL, calculate: calculateResult, validate })

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
              message={`Ponto de equilíbrio: ${formatNumber(result.breakEvenProd, 1)} sc/ha ao preço base de ${formatCurrency(result.priceSteps[Math.floor(result.priceSteps.length / 2)])}/sc`}
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
          prefix="R$" mask="currency" unit="R$/ha"
          value={inputs.productionCost}
          onChange={(v) => updateInput('productionCost', v as string)}
          placeholder="ex: 3500"
          min="0"
          required
          hint="Custo total por hectare (insumos + operações + fixos)"
        />
        <InputField
          label="Área total"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v as string)}
          placeholder="ex: 500"
          min="0"
          required
          hint="Área total plantada para a simulação"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Preço mínimo"
          prefix="R$" mask="currency" unit="R$/sc"
          value={inputs.priceMin}
          onChange={(v) => updateInput('priceMin', v as string)}
          placeholder="ex: 90"
          min="0"
          required
          hint="Pior cenário de preço de venda"
        />
        <InputField
          label="Preço máximo"
          prefix="R$" mask="currency" unit="R$/sc"
          value={inputs.priceMax}
          onChange={(v) => updateInput('priceMax', v as string)}
          placeholder="ex: 140"
          min="0"
          required
          hint="Melhor cenário de preço de venda"
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
          hint="Pior cenário de produtividade"
        />
        <InputField
          label="Produtividade máxima"
          unit="sc/ha"
          value={inputs.prodMax}
          onChange={(v) => updateInput('prodMax', v as string)}
          placeholder="ex: 70"
          min="0"
          required
          hint="Melhor cenário de produtividade"
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

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.productionCost || !inputs.area || !inputs.priceMin} />
    </CalculatorLayout>
  )
}
