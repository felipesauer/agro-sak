import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { calculateMachineDepreciation, validateMachineDepreciation, type MachineDepreciationResult } from '../../core/operational/machine-depreciation'

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

// ── Calculation ──

function calculate(inputs: Inputs): MachineDepreciationResult | null {
  return calculateMachineDepreciation({
    purchasePrice: parseFloat(inputs.purchasePrice),
    residualPercent: parseFloat(inputs.residualPercent),
    lifeYears: parseInt(inputs.lifeYears),
    totalLifeHours: parseFloat(inputs.totalLifeHours),
    hoursPerYear: parseFloat(inputs.hoursPerYear) || 800,
    method: inputs.method as 'linear' | 'hours',
  })
}

function validate(inputs: Inputs): string | null {
  return validateMachineDepreciation({
    purchasePrice: parseFloat(inputs.purchasePrice),
    lifeYears: parseInt(inputs.lifeYears),
  })
}

// ── Component ──

export default function MachineDepreciation() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, MachineDepreciationResult>({ initialInputs: INITIAL, calculate, validate })

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
              <ComparisonTable
                columns={[
                  { key: 'year' as const, label: 'Ano' },
                  { key: 'depreciation' as const, label: 'Depreciação', format: (v) => formatCurrency(v as number, 0) },
                  { key: 'maintenance' as const, label: 'Manutenção', format: (v) => formatCurrency(v as number, 0) },
                  { key: 'marketValue' as const, label: 'Valor de Mercado', format: (v) => formatCurrency(v as number, 0) },
                ]}
                rows={result.yearTable}
              />
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
        <InputField label="Valor de aquisição" prefix="R$" mask="currency" unit="R$" value={inputs.purchasePrice} onChange={(v) => updateInput('purchasePrice', v)} step="10000" required hint="Preço pago na compra (nota fiscal)" />
        <InputField label="Valor residual estimado" unit="%" value={inputs.residualPercent} onChange={(v) => updateInput('residualPercent', v)} step="5" hint="Percentual do valor original ao final da vida útil (10-20%)" />
        <InputField label="Vida útil" unit="anos" value={inputs.lifeYears} onChange={(v) => updateInput('lifeYears', v)} required hint="Vida útil contábil ou esperada da máquina" />
        <InputField label="Vida útil total" unit="horas" value={inputs.totalLifeHours} onChange={(v) => updateInput('totalLifeHours', v)} hint="Horas totais estimadas (consulte o fabricante)" />
        <InputField label="Horas trabalhadas por ano" unit="h/ano" value={inputs.hoursPerYear} onChange={(v) => updateInput('hoursPerYear', v)} hint="Média de horas registradas no horímetro por ano" />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.purchasePrice || !inputs.lifeYears} />
    </CalculatorLayout>
  )
}
