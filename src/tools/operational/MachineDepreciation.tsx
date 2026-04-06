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
  machineType: string
  purchasePrice: string
  residualPercent: string
  lifeYears: string
  totalLifeHours: string
  hoursPerYear: string
  method: string
}

interface YearRow {
  year: number
  depreciation: number
  maintenance: number
  marketValue: number
}

interface Result {
  depreciationYear: number
  depreciationHour: number
  yearTable: YearRow[]
  totalCostOfOwnership: number
  alertLifePercent: number
}

const MACHINE_OPTIONS = [
  { value: 'tractor', label: 'Trator' },
  { value: 'harvester', label: 'Colheitadeira' },
  { value: 'planter', label: 'Plantadeira' },
  { value: 'sprayer', label: 'Pulverizador' },
]

const METHOD_OPTIONS = [
  { value: 'linear', label: 'Linear (igual todos os anos)' },
  { value: 'hours', label: 'Por horas trabalhadas' },
]

const INITIAL: Inputs = {
  machineType: 'tractor',
  purchasePrice: '850000',
  residualPercent: '25',
  lifeYears: '10',
  totalLifeHours: '12000',
  hoursPerYear: '800',
  method: 'linear',
}

function maintenanceRate(year: number): number {
  if (year <= 3) return 0.02
  if (year <= 6) return 0.035
  return 0.05
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const price = parseFloat(inputs.purchasePrice)
  const residualPct = parseFloat(inputs.residualPercent) / 100
  const life = parseInt(inputs.lifeYears)
  const totalHours = parseFloat(inputs.totalLifeHours)
  const hpy = parseFloat(inputs.hoursPerYear) || 800
  const residual = price * residualPct
  const depreciable = price - residual

  let depreciationYear: number
  let depreciationHour: number

  if (inputs.method === 'linear') {
    depreciationYear = depreciable / life
    depreciationHour = depreciationYear / hpy
  } else {
    depreciationHour = depreciable / totalHours
    depreciationYear = depreciationHour * hpy
  }

  const yearTable: YearRow[] = []
  let accumulated = 0
  let tco = 0

  for (let y = 1; y <= life; y++) {
    const dep = depreciationYear
    accumulated += dep
    const mntRate = maintenanceRate(y)
    const maintenance = price * mntRate
    const marketValue = Math.max(price - accumulated, residual)
    tco += dep + maintenance
    yearTable.push({ year: y, depreciation: dep, maintenance, marketValue })
  }

  const hoursUsed = hpy * life
  const alertLifePercent = totalHours > 0 ? (hoursUsed / totalHours) * 100 : 0

  return {
    depreciationYear,
    depreciationHour,
    yearTable,
    totalCostOfOwnership: tco,
    alertLifePercent,
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.purchasePrice || parseFloat(inputs.purchasePrice) <= 0)
    return 'Informe o valor de aquisição'
  if (!inputs.lifeYears || parseInt(inputs.lifeYears) <= 0) return 'Informe a vida útil'
  return null
}

// ── Component ──

export default function MachineDepreciation() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Depreciação de Máquinas"
      description="Depreciação anual/hora, valor residual e custo de manutenção ao longo da vida útil."
      about="Calcule a depreciação anual de tratores, colhedoras, plantadeiras e pulverizadores. Acompanhe a perda de valor e o custo crescente de manutenção ao longo dos anos."
      methodology="Linear: Depreciação = (Valor inicial - Valor residual) / Vida útil. Por horas: Depreciação = (Valor - Residual) / Horas totais de vida útil. Manutenção crescente por faixas etárias."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard label="Depreciação anual" value={formatCurrency(result.depreciationYear, 0)} unit="/ano" highlight variant="warning" />
              <ResultCard label="Depreciação por hora" value={formatCurrency(result.depreciationHour)} unit="/h" highlight variant="warning" />
            </div>
            <ResultCard label="Custo total de propriedade (TCO)" value={formatCurrency(result.totalCostOfOwnership, 0)} unit="" variant="warning" />

            {result.alertLifePercent >= 60 && (
              <AlertBanner
                variant="warning"
                message={`Máquina atingirá ${formatPercent(result.alertLifePercent, 0)} da vida útil — hora de planejar a troca.`}
              />
            )}

            {/* Year-by-year table */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 overflow-x-auto">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Projeção ano a ano
              </p>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-1 pr-2">Ano</th>
                    <th className="pb-1 pr-2">Depreciação</th>
                    <th className="pb-1 pr-2">Manutenção</th>
                    <th className="pb-1">Valor de Mercado</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearTable.map((row) => (
                    <tr key={row.year} className="border-t border-gray-200">
                      <td className="py-1 pr-2">{row.year}</td>
                      <td className="py-1 pr-2">{formatCurrency(row.depreciation, 0)}</td>
                      <td className="py-1 pr-2">{formatCurrency(row.maintenance, 0)}</td>
                      <td className="py-1">{formatCurrency(row.marketValue, 0)}</td>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Tipo de máquina" options={MACHINE_OPTIONS} value={inputs.machineType} onChange={(v) => updateInput('machineType', v)} />
        <SelectField label="Método de depreciação" options={METHOD_OPTIONS} value={inputs.method} onChange={(v) => updateInput('method', v)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mt-3">
        <InputField label="Valor de aquisição" prefix="R$" unit="R$" value={inputs.purchasePrice} onChange={(v) => updateInput('purchasePrice', v)} step="10000" required />
        <InputField label="Valor residual estimado" unit="%" value={inputs.residualPercent} onChange={(v) => updateInput('residualPercent', v)} step="5" />
        <InputField label="Vida útil" unit="anos" value={inputs.lifeYears} onChange={(v) => updateInput('lifeYears', v)} required />
        <InputField label="Vida útil total" unit="horas" value={inputs.totalLifeHours} onChange={(v) => updateInput('totalLifeHours', v)} />
        <InputField label="Horas trabalhadas por ano" unit="h/ano" value={inputs.hoursPerYear} onChange={(v) => updateInput('hoursPerYear', v)} />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
