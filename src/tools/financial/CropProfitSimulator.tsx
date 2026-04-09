import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { calculateCropProfit, validateCropProfit, type CropProfitResult } from '../../core/financial/crop-profit'

// ── Types ──

interface Inputs {
  producerType: string
  area: string
  // Pessimist
  yieldPess: string
  pricePess: string
  costPess: string
  // Realistic
  yieldReal: string
  priceReal: string
  costReal: string
  // Optimist
  yieldOpt: string
  priceOpt: string
  costOpt: string
}

const PRODUCER_OPTIONS = [
  { value: 'pf', label: 'Pessoa Física (PF) — 1,5%' },
  { value: 'pj', label: 'Pessoa Jurídica (PJ) — 2,85%' },
]

const FUNRURAL: Record<string, number> = { pf: 1.5, pj: 2.85 }

const INITIAL: Inputs = {
  producerType: 'pf',
  area: '500',
  yieldPess: '52', pricePess: '100', costPess: '4200',
  yieldReal: '62', priceReal: '115', costReal: '4000',
  yieldOpt: '72', priceOpt: '130', costOpt: '3800',
}

// ── Calculation ──

function calculate(inputs: Inputs): CropProfitResult | null {
  const area = parseFloat(inputs.area) || 0
  const taxRate = (FUNRURAL[inputs.producerType] ?? 1.5) / 100

  return calculateCropProfit({
    areaHa: area,
    taxRate,
    scenarios: [
      { label: 'Pessimista', yieldScHa: parseFloat(inputs.yieldPess) || 0, pricePerSc: parseFloat(inputs.pricePess) || 0, costPerHa: parseFloat(inputs.costPess) || 0 },
      { label: 'Realista', yieldScHa: parseFloat(inputs.yieldReal) || 0, pricePerSc: parseFloat(inputs.priceReal) || 0, costPerHa: parseFloat(inputs.costReal) || 0 },
      { label: 'Otimista', yieldScHa: parseFloat(inputs.yieldOpt) || 0, pricePerSc: parseFloat(inputs.priceOpt) || 0, costPerHa: parseFloat(inputs.costOpt) || 0 },
    ],
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.area || parseFloat(inputs.area) <= 0) return 'Informe a área plantada'
  return validateCropProfit({
    areaHa: parseFloat(inputs.area) || 0,
    taxRate: (FUNRURAL[inputs.producerType] ?? 1.5) / 100,
    scenarios: [
      { label: 'Pessimista', yieldScHa: parseFloat(inputs.yieldPess) || 0, pricePerSc: parseFloat(inputs.pricePess) || 0, costPerHa: parseFloat(inputs.costPess) || 0 },
      { label: 'Realista', yieldScHa: parseFloat(inputs.yieldReal) || 0, pricePerSc: parseFloat(inputs.priceReal) || 0, costPerHa: parseFloat(inputs.costReal) || 0 },
      { label: 'Otimista', yieldScHa: parseFloat(inputs.yieldOpt) || 0, pricePerSc: parseFloat(inputs.priceOpt) || 0, costPerHa: parseFloat(inputs.costOpt) || 0 },
    ],
  })
}

// ── Component ──

const SCENARIO_COLORS = ['text-red-700', 'text-agro-800', 'text-blue-700']
const SCENARIO_BG = ['bg-red-50 border-red-200', 'bg-agro-50 border-agro-200', 'bg-blue-50 border-blue-200']

export default function CropProfitSimulator() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, CropProfitResult>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Simulador de Lucro da Safra"
      description="Simule 3 cenários (pessimista, realista, otimista) cruzando preço, produtividade e custo."
      about="Simule 3 cenários de resultado da safra (pessimista, realista e otimista) variando produtividade e preço. Visualize o risco e potencial de lucro antes de plantar."
      methodology="Lucro = (Produtividade × Preço - Funrural) - Custo. Cenários aplicam variação de ±15% (pessimista/otimista) sobre os valores base."
      result={
        result && (
          <div className="space-y-4">
            {/* Scenario cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              {result.scenarios.map((s, i) => (
                <div key={s.label} className={`rounded-lg border p-4 ${SCENARIO_BG[i]}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.profit >= 0 ? 'text-agro-800' : 'text-red-700'}`}>
                    {formatCurrency(s.profit, 0)}<span className="text-sm font-normal text-gray-500 ml-1">/ha</span>
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <p>Receita Líq.: {formatCurrency(s.netRevenue, 0)}/ha</p>
                    <p>Margem: {formatPercent(s.margin)}</p>
                    <p>ROI: {formatPercent(s.roi)}</p>
                    <p className="pt-1 font-medium">Total fazenda: {formatCurrency(s.totalResult, 0)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual bar comparison */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Comparativo de lucro por hectare
              </p>
              {result.scenarios.map((s, i) => {
                const max = Math.max(...result.scenarios.map((x) => Math.abs(x.profit)))
                const width = max > 0 ? (Math.abs(s.profit) / max) * 100 : 0
                return (
                  <div key={s.label} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-medium ${SCENARIO_COLORS[i]}`}>{s.label}</span>
                      <span className={s.profit >= 0 ? 'text-agro-700' : 'text-red-600'}>
                        {formatCurrency(s.profit, 0)}/ha
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${s.profit >= 0 ? 'bg-agro-500' : 'bg-red-400'}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <AlertBanner
              variant="info"
              message="A simulação considera cenários estáticos — variações cambiais, climáticas e de mercado podem alterar significativamente os resultados."
            />
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Tipo de produtor (Funrural)"
          options={PRODUCER_OPTIONS}
          value={inputs.producerType}
          onChange={(v) => updateInput('producerType', v)}
        />
        <InputField
          label="Área plantada"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v)}
          placeholder="ex: 500"
          required
          hint="Área total cultivada para a simulação"
        />
      </div>

      {/* Scenario inputs */}
      {([
        { title: 'Pessimista', yKey: 'yieldPess' as const, pKey: 'pricePess' as const, cKey: 'costPess' as const },
        { title: 'Realista', yKey: 'yieldReal' as const, pKey: 'priceReal' as const, cKey: 'costReal' as const },
        { title: 'Otimista', yKey: 'yieldOpt' as const, pKey: 'priceOpt' as const, cKey: 'costOpt' as const },
      ]).map((sc) => (
        <div key={sc.title} className="border border-gray-200 rounded-lg p-4 mt-4">
          <p className="font-medium text-gray-700 mb-3">{sc.title}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <InputField
              label="Produtividade"
              unit="sc/ha"
              value={inputs[sc.yKey]}
              onChange={(v) => updateInput(sc.yKey, v)}
              step="1"
              hint="Sacas colhidas por hectare no cenário"
            />
            <InputField
              label="Preço de venda"
              prefix="R$" mask="currency" unit="R$/sc"
              value={inputs[sc.pKey]}
              onChange={(v) => updateInput(sc.pKey, v)}
              step="0.50"
              hint="Cotação esperada da saca no momento da venda"
            />
            <InputField
              label="Custo de produção"
              prefix="R$" mask="currency" unit="R$/ha"
              value={inputs[sc.cKey]}
              onChange={(v) => updateInput(sc.cKey, v)}
              step="10"
              hint="Custo total por hectare incluindo insumos e operações"
            />
          </div>
        </div>
      ))}

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area || !inputs.yieldReal || !inputs.priceReal} />
    </CalculatorLayout>
  )
}
