import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatPercent } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  paymentMode: string
  leaseValue: string
  expectedYield: string
  sacPrice: string
  area: string
  costWithoutLease: string
}

interface Result {
  leaseCostHa: number
  totalLeaseCost: number
  percentOfCost: number
  percentOfRevenue: number
  revenueHa: number
}

const PAYMENT_MODE_OPTIONS = [
  { value: 'sacks', label: 'Sacas por hectare (sc/ha)' },
  { value: 'fixed', label: 'Valor fixo (R$/ha)' },
]

const INITIAL: Inputs = {
  paymentMode: 'sacks',
  leaseValue: '15',
  expectedYield: '62',
  sacPrice: '115',
  area: '500',
  costWithoutLease: '3500',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const area = parseFloat(inputs.area) || 0
  const yld = parseFloat(inputs.expectedYield) || 0
  const price = parseFloat(inputs.sacPrice) || 0
  const costBase = parseFloat(inputs.costWithoutLease) || 0
  const leaseVal = parseFloat(inputs.leaseValue) || 0

  const leaseCostHa = inputs.paymentMode === 'sacks' ? leaseVal * price : leaseVal
  const totalLeaseCost = leaseCostHa * area
  const totalCost = costBase + leaseCostHa
  const percentOfCost = totalCost > 0 ? (leaseCostHa / totalCost) * 100 : 0
  const revenueHa = yld * price
  const percentOfRevenue = revenueHa > 0 ? (leaseCostHa / revenueHa) * 100 : 0

  return { leaseCostHa, totalLeaseCost, percentOfCost, percentOfRevenue, revenueHa }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.leaseValue || parseFloat(inputs.leaseValue) <= 0)
    return 'Informe o valor do arrendamento'
  if (!inputs.sacPrice || parseFloat(inputs.sacPrice) <= 0)
    return 'Informe o preço da saca'
  if (!inputs.expectedYield) return 'Informe a produtividade esperada'
  return null
}

// ── Reference data ──

const LEASE_REFERENCE = [
  { region: 'Mato Grosso', range: '14 – 18 sc/ha' },
  { region: 'Goiás', range: '12 – 16 sc/ha' },
  { region: 'Mato Grosso do Sul', range: '13 – 17 sc/ha' },
  { region: 'Paraná', range: '15 – 20 sc/ha' },
  { region: 'Rio Grande do Sul', range: '12 – 16 sc/ha' },
  { region: 'Bahia (MATOPIBA)', range: '10 – 14 sc/ha' },
]

// ── Component ──

export default function FarmLease() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Arrendamento Rural"
      description="Calcule o custo real do arrendamento e sua participação nos custos e na receita."
      about="Calcule o custo do arrendamento rural em sacas por hectare ou valor fixo. Compare regiões e avalie se arrendar é mais vantajoso que investir na compra de terra."
      methodology="Custo anual = Fator de arrendamento (sc/ha) × Preço da saca × Área. Custo equivalente mensal para comparação com financiamento. Referências regionais da CONAB."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Custo do arrendamento"
                value={formatCurrency(result.leaseCostHa, 0)}
                unit="/ha"
                highlight
                variant="warning"
              />
              <ResultCard
                label="Custo total na área"
                value={formatCurrency(result.totalLeaseCost, 0)}
                unit=""
                highlight
                variant="warning"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="% do custo total"
                value={formatPercent(result.percentOfCost)}
                unit=""
                variant="warning"
              />
              <ResultCard
                label="% da receita bruta"
                value={formatPercent(result.percentOfRevenue)}
                unit=""
                variant="warning"
              >
                <p className="text-xs text-gray-500 mt-1">
                  Receita bruta: {formatCurrency(result.revenueHa, 0)}/ha
                </p>
              </ResultCard>
            </div>

            {result.percentOfRevenue > 20 && (
              <AlertBanner
                variant="warning"
                message={`Arrendamento representa ${formatPercent(result.percentOfRevenue)} da receita bruta — acima do limite recomendado de 20%.`}
              />
            )}

            {/* Regional reference */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Médias regionais de arrendamento (soja)
              </p>
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-1">Região</th>
                    <th className="pb-1">Arrendamento</th>
                  </tr>
                </thead>
                <tbody>
                  {LEASE_REFERENCE.map((row) => (
                    <tr key={row.region} className="border-t border-gray-200">
                      <td className="py-1">{row.region}</td>
                      <td className="py-1">{row.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )
      }
    >
      <SelectField
        label="Modalidade de pagamento"
        options={PAYMENT_MODE_OPTIONS}
        value={inputs.paymentMode}
        onChange={(v) => updateInput('paymentMode', v)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Valor do arrendamento"
          unit={inputs.paymentMode === 'sacks' ? 'sc/ha' : 'R$/ha'}
          value={inputs.leaseValue}
          onChange={(v) => updateInput('leaseValue', v)}
          placeholder={inputs.paymentMode === 'sacks' ? 'ex: 15' : 'ex: 1725'}
          step="0.5"
          required
        />
        <InputField
          label="Preço da saca"
          prefix="R$" unit="R$"
          value={inputs.sacPrice}
          onChange={(v) => updateInput('sacPrice', v)}
          placeholder="ex: 115"
          step="0.01"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Produtividade esperada"
          unit="sc/ha"
          value={inputs.expectedYield}
          onChange={(v) => updateInput('expectedYield', v)}
          placeholder="ex: 62"
          required
        />
        <InputField
          label="Área arrendada"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v)}
          placeholder="ex: 500"
        />
        <InputField
          label="Custo (sem arrendamento)"
          prefix="R$" unit="R$/ha"
          value={inputs.costWithoutLease}
          onChange={(v) => updateInput('costWithoutLease', v)}
          placeholder="ex: 3500"
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
