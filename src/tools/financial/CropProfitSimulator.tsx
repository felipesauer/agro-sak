import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatPercent } from '../../utils/formatters'

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

interface ScenarioResult {
  label: string
  grossRevenue: number
  taxes: number
  netRevenue: number
  profit: number
  margin: number
  roi: number
  totalResult: number
}

interface Result {
  scenarios: ScenarioResult[]
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

function calculate(inputs: Inputs): Result | null {
  const area = parseFloat(inputs.area) || 0
  const taxRate = (FUNRURAL[inputs.producerType] ?? 1.5) / 100

  const configs = [
    { label: 'Pessimista', y: inputs.yieldPess, p: inputs.pricePess, c: inputs.costPess },
    { label: 'Realista', y: inputs.yieldReal, p: inputs.priceReal, c: inputs.costReal },
    { label: 'Otimista', y: inputs.yieldOpt, p: inputs.priceOpt, c: inputs.costOpt },
  ]

  const scenarios: ScenarioResult[] = configs.map((cfg) => {
    const yld = parseFloat(cfg.y) || 0
    const price = parseFloat(cfg.p) || 0
    const cost = parseFloat(cfg.c) || 0

    const grossRevenue = yld * price
    const taxes = grossRevenue * taxRate
    const netRevenue = grossRevenue - taxes
    const profit = netRevenue - cost
    const margin = grossRevenue > 0 ? (profit / grossRevenue) * 100 : 0
    const roi = cost > 0 ? (profit / cost) * 100 : 0
    const totalResult = profit * area

    return { label: cfg.label, grossRevenue, taxes, netRevenue, profit, margin, roi, totalResult }
  })

  return { scenarios }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.area || parseFloat(inputs.area) <= 0) return 'Informe a área plantada'
  if (!inputs.yieldReal || !inputs.priceReal || !inputs.costReal)
    return 'Preencha pelo menos o cenário realista'
  const yP = parseFloat(inputs.yieldPess)
  const yR = parseFloat(inputs.yieldReal)
  const yO = parseFloat(inputs.yieldOpt)
  if (!isNaN(yP) && !isNaN(yR) && yP > yR)
    return 'Produtividade pessimista deve ser ≤ realista'
  if (!isNaN(yR) && !isNaN(yO) && yR > yO)
    return 'Produtividade realista deve ser ≤ otimista'
  return null
}

// ── Component ──

const SCENARIO_COLORS = ['text-red-700', 'text-agro-800', 'text-blue-700']
const SCENARIO_BG = ['bg-red-50 border-red-200', 'bg-agro-50 border-agro-200', 'bg-blue-50 border-blue-200']

export default function CropProfitSimulator() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

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
