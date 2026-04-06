import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  // Própria
  purchasePrice: string
  lifeYears: string
  hoursPerYear: string
  capitalRate: string
  insuranceRate: string
  maintenanceRate: string
  fuelConsumption: string
  dieselPrice: string
  operatorSalary: string
  operationalCapacity: string
  machineType: string
  // Aluguel
  rentalHourly: string
  rentalIncludesOperator: string
  rentalIncludesFuel: string
  // Terceirização
  outsourceHa: string
}

interface CostBreakdown {
  depreciation: number
  interest: number
  insurance: number
  maintenance: number
  fuel: number
  operator: number
  total: number
  perHa: number
}

interface Result {
  own: CostBreakdown
  rental: { totalH: number; perHa: number }
  outsource: { perHa: number }
  recommendation: string
  breakEvenHours: number
}

const MACHINE_OPTIONS = [
  { value: 'tractor', label: 'Trator' },
  { value: 'harvester', label: 'Colheitadeira' },
  { value: 'planter', label: 'Plantadeira' },
  { value: 'sprayer', label: 'Pulverizador' },
]

const RESIDUAL_VALUE: Record<string, number> = {
  tractor: 0.3,
  harvester: 0.2,
  planter: 0.15,
  sprayer: 0.2,
}

const INITIAL: Inputs = {
  machineType: 'harvester',
  purchasePrice: '1800000',
  lifeYears: '12',
  hoursPerYear: '600',
  capitalRate: '8',
  insuranceRate: '1.5',
  maintenanceRate: '3',
  fuelConsumption: '35',
  dieselPrice: '6.20',
  operatorSalary: '4500',
  operationalCapacity: '12',
  rentalHourly: '850',
  rentalIncludesOperator: 'yes',
  rentalIncludesFuel: 'yes',
  outsourceHa: '250',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const price = parseFloat(inputs.purchasePrice)
  const life = parseFloat(inputs.lifeYears)
  const hpy = parseFloat(inputs.hoursPerYear)
  const capRate = parseFloat(inputs.capitalRate) / 100
  const insRate = parseFloat(inputs.insuranceRate) / 100
  const mntRate = parseFloat(inputs.maintenanceRate) / 100
  const fuelL = parseFloat(inputs.fuelConsumption)
  const diesel = parseFloat(inputs.dieselPrice)
  const salary = parseFloat(inputs.operatorSalary)
  const capOp = parseFloat(inputs.operationalCapacity) || 1
  const vr = RESIDUAL_VALUE[inputs.machineType] ?? 0.2

  const depreciation = (price * (1 - vr)) / (life * hpy)
  const interest = (price * capRate) / hpy
  const insurance = (price * insRate) / hpy
  const maintenance = (price * mntRate) / hpy
  const fuel = fuelL * diesel
  const operator = (salary * 13.33) / hpy
  const total = depreciation + interest + insurance + maintenance + fuel + operator
  const perHa = total / capOp

  const own: CostBreakdown = { depreciation, interest, insurance, maintenance, fuel, operator, total, perHa }

  // Aluguel
  let rentalH = parseFloat(inputs.rentalHourly) || 0
  if (inputs.rentalIncludesOperator === 'no') rentalH += operator
  if (inputs.rentalIncludesFuel === 'no') rentalH += fuel
  const rentalHa = rentalH / capOp

  // Terceirização
  const outsourceHa = parseFloat(inputs.outsourceHa) || 0

  // Recommendation
  const costs = [
    { label: 'Própria', v: perHa },
    { label: 'Aluguel', v: rentalHa },
    { label: 'Terceirização', v: outsourceHa },
  ]
  costs.sort((a, b) => a.v - b.v)
  const recommendation = `${costs[0].label} é a opção mais econômica (${formatCurrency(costs[0].v)}/ha)`

  // Break-even: hours/year where own cost equals rental
  // own fixed cost/h (depr+interest+ins+maint) = price*(1-vr)/(life*H) + price*(cap+ins+mnt)/H
  // fuel and operator are variable and exist in both
  const fixedAnnual = (price * (1 - vr)) / life + price * (capRate + insRate + mntRate)
  // rental cost savings per hour (only the fixed part)
  const rentalAdj = parseFloat(inputs.rentalHourly) || 0
  const ownVariable = fuel + operator
  const savingPerH = rentalAdj - ownVariable
  const breakEvenHours = savingPerH > 0 ? fixedAnnual / savingPerH : 0

  return {
    own,
    rental: { totalH: rentalH, perHa: rentalHa },
    outsource: { perHa: outsourceHa },
    recommendation,
    breakEvenHours: Math.round(breakEvenHours),
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.purchasePrice || parseFloat(inputs.purchasePrice) <= 0)
    return 'Informe o valor de compra'
  if (!inputs.hoursPerYear || parseFloat(inputs.hoursPerYear) <= 0)
    return 'Informe as horas de uso por ano'
  return null
}

// ── Component ──

export default function MachineryCost() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  const COST_LABELS: { key: keyof CostBreakdown; label: string }[] = [
    { key: 'depreciation', label: 'Depreciação' },
    { key: 'interest', label: 'Juros/Capital' },
    { key: 'insurance', label: 'Seguro' },
    { key: 'maintenance', label: 'Manutenção' },
    { key: 'fuel', label: 'Combustível' },
    { key: 'operator', label: 'Operador' },
  ]

  return (
    <CalculatorLayout
      title="Custo de Máquinas"
      description="Compare o custo real de máquina própria, aluguel e terceirização (R$/h e R$/ha)."
      about="Compare o custo total de possuir, alugar ou terceirizar máquinas agrícolas. Inclui depreciação, manutenção, juros, seguro, combustível e operador."
      methodology="Custo de propriedade = Depreciação + Juros + Seguro + Manutenção + Combustível + Operador. Depreciação linear com valor residual. Juros sobre capital médio investido."
      result={
        result && (
          <div className="space-y-4">
            {/* Comparison cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Própria', h: formatCurrency(result.own.total), ha: result.own.perHa },
                { label: 'Aluguel', h: formatCurrency(result.rental.totalH), ha: result.rental.perHa },
                { label: 'Terceirização', h: '—', ha: result.outsource.perHa },
              ].map((opt) => {
                const isMin = opt.ha === Math.min(result.own.perHa, result.rental.perHa, result.outsource.perHa)
                return (
                  <div key={opt.label} className={`rounded-lg border p-4 ${isMin ? 'bg-agro-50 border-agro-300' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{opt.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(opt.ha)}<span className="text-sm font-normal text-gray-500 ml-1">/ha</span></p>
                    {opt.h !== '—' && <p className="text-xs text-gray-500 mt-1">({opt.h}/h)</p>}
                    {isMin && <span className="text-xs text-agro-700 font-medium">✓ Mais econômico</span>}
                  </div>
                )
              })}
            </div>

            <AlertBanner variant="info" message={result.recommendation} />

            {result.breakEvenHours > 0 && (
              <ResultCard
                label="Break-even (compra vs aluguel)"
                value={`${result.breakEvenHours}`}
                unit="h/ano"
                variant="default"
              >
                <p className="text-xs text-gray-500">
                  {parseFloat(inputs.hoursPerYear) >= result.breakEvenHours
                    ? 'Seu uso justifica a compra'
                    : 'Uso abaixo do break-even — aluguel pode ser melhor'}
                </p>
              </ResultCard>
            )}

            {/* Cost decomposition */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Decomposição do custo próprio (R$/h)
              </p>
              {COST_LABELS.map((c) => {
                const val = result.own[c.key] as number
                const pct = result.own.total > 0 ? (val / result.own.total) * 100 : 0
                return (
                  <div key={c.key} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{c.label}</span>
                      <span className="text-gray-600">{formatCurrency(val)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-agro-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {parseFloat(inputs.hoursPerYear) < 400 && (
              <AlertBanner
                variant="warning"
                message="Com menos de 400 h/ano de uso, terceirização quase sempre é mais econômica."
              />
            )}
          </div>
        )
      }
    >
      <SelectField
        label="Tipo de máquina"
        options={MACHINE_OPTIONS}
        value={inputs.machineType}
        onChange={(v) => updateInput('machineType', v)}
      />

      <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Máquina Própria</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="Valor de compra" prefix="R$" unit="R$" value={inputs.purchasePrice} onChange={(v) => updateInput('purchasePrice', v)} step="10000" required />
        <InputField label="Vida útil" unit="anos" value={inputs.lifeYears} onChange={(v) => updateInput('lifeYears', v)} />
        <InputField label="Horas de uso por ano" unit="h/ano" value={inputs.hoursPerYear} onChange={(v) => updateInput('hoursPerYear', v)} required />
        <InputField label="Custo de capital" unit="% a.a." value={inputs.capitalRate} onChange={(v) => updateInput('capitalRate', v)} step="0.5" />
        <InputField label="Seguro" unit="% do valor/ano" value={inputs.insuranceRate} onChange={(v) => updateInput('insuranceRate', v)} step="0.1" />
        <InputField label="Manutenção" unit="% do valor/ano" value={inputs.maintenanceRate} onChange={(v) => updateInput('maintenanceRate', v)} step="0.5" />
        <InputField label="Consumo de combustível" unit="L/h" value={inputs.fuelConsumption} onChange={(v) => updateInput('fuelConsumption', v)} />
        <InputField label="Preço do diesel" prefix="R$" unit="R$/L" value={inputs.dieselPrice} onChange={(v) => updateInput('dieselPrice', v)} step="0.10" />
        <InputField label="Salário do operador" prefix="R$" unit="R$/mês" value={inputs.operatorSalary} onChange={(v) => updateInput('operatorSalary', v)} />
        <InputField label="Capacidade operacional" unit="ha/h" value={inputs.operationalCapacity} onChange={(v) => updateInput('operationalCapacity', v)} />
      </div>

      <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Aluguel (hora-máquina)</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <InputField label="Valor cobrado" prefix="R$" unit="R$/h" value={inputs.rentalHourly} onChange={(v) => updateInput('rentalHourly', v)} />
        <SelectField label="Inclui operador?" options={[{value:'yes',label:'Sim'},{value:'no',label:'Não'}]} value={inputs.rentalIncludesOperator} onChange={(v) => updateInput('rentalIncludesOperator', v)} />
        <SelectField label="Inclui combustível?" options={[{value:'yes',label:'Sim'},{value:'no',label:'Não'}]} value={inputs.rentalIncludesFuel} onChange={(v) => updateInput('rentalIncludesFuel', v)} />
      </div>

      <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Terceirização</p>
      <InputField label="Valor cobrado" prefix="R$" unit="R$/ha" value={inputs.outsourceHa} onChange={(v) => updateInput('outsourceHa', v)} />

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
