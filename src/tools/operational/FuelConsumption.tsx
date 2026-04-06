import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  operation: string
  consumptionPerHour: string
  operationalCapacity: string
  dieselPrice: string
  area: string
}

interface Result {
  litersPerHa: number
  costPerHa: number
  totalCost: number | null
  totalLiters: number | null
}

const OPERATION_OPTIONS = [
  { value: 'planting', label: 'Plantio' },
  { value: 'spraying', label: 'Pulverização' },
  { value: 'harvesting', label: 'Colheita' },
  { value: 'disk-harrow', label: 'Grade aradora' },
  { value: 'subsoiling', label: 'Subsolagem' },
  { value: 'other', label: 'Outra operação' },
]

// Default consumption (L/h) by operation — midpoint of reference ranges
const OPERATION_DEFAULTS: Record<string, { consumptionPerHour: string; operationalCapacity: string }> = {
  planting: { consumptionPerHour: '22', operationalCapacity: '5.5' },
  spraying: { consumptionPerHour: '24', operationalCapacity: '15' },
  harvesting: { consumptionPerHour: '36', operationalCapacity: '3.5' },
  'disk-harrow': { consumptionPerHour: '30', operationalCapacity: '2.5' },
  subsoiling: { consumptionPerHour: '35', operationalCapacity: '1.8' },
  other: { consumptionPerHour: '', operationalCapacity: '' },
}

const INITIAL: Inputs = {
  operation: 'planting',
  consumptionPerHour: '22',
  operationalCapacity: '5.5',
  dieselPrice: '6.20',
  area: '',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const consumption = parseFloat(inputs.consumptionPerHour)
  const capacity = parseFloat(inputs.operationalCapacity)
  const price = parseFloat(inputs.dieselPrice)
  const area = parseFloat(inputs.area) || 0

  // Consumo (L/ha) = Consumo_h / Capacidade_op
  const litersPerHa = consumption / capacity

  // Custo (R$/ha) = L/ha × preço diesel
  const costPerHa = litersPerHa * price

  const totalCost = area > 0 ? costPerHa * area : null
  const totalLiters = area > 0 ? litersPerHa * area : null

  return { litersPerHa, costPerHa, totalCost, totalLiters }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.consumptionPerHour) return 'Informe o consumo do motor (L/h)'
  if (!inputs.operationalCapacity) return 'Informe a capacidade operacional (ha/h)'
  if (!inputs.dieselPrice) return 'Informe o preço do diesel'
  if (parseFloat(inputs.operationalCapacity) <= 0) return 'Capacidade operacional deve ser positiva'
  return null
}

// ── Reference data ──

const CONSUMPTION_REFERENCE = [
  { operation: 'Grade aradora pesada', range: '25 – 35 L/h' },
  { operation: 'Plantio soja (12 m)', range: '18 – 25 L/h' },
  { operation: 'Pulverização autopropelido', range: '20 – 28 L/h' },
  { operation: 'Colheita soja', range: '28 – 45 L/h' },
]

// ── Component ──

export default function FuelConsumption() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  const handleOperationChange = (value: string) => {
    updateInput('operation', value)
    const defaults = OPERATION_DEFAULTS[value]
    if (defaults) {
      updateInput('consumptionPerHour', defaults.consumptionPerHour)
      updateInput('operationalCapacity', defaults.operationalCapacity)
    }
  }

  return (
    <CalculatorLayout
      title="Consumo de Combustível por Hectare"
      description="Calcule o consumo de diesel (L/ha) e o custo de combustível por operação agrícola."
      about="Calcule o consumo de diesel por hectare para cada operação mecanizada. Compare custos entre operações e identifique onde economizar combustível."
      methodology="Consumo L/ha = Consumo horário (L/h) / Capacidade operacional (ha/h). Valores de referência por operação baseados em ensaios da EMBRAPA e CONAB."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Consumo por hectare"
                value={formatNumber(result.litersPerHa, 2)}
                unit="L/ha"
                highlight
                variant="default"
              />
              <ResultCard
                label="Custo por hectare"
                value={formatCurrency(result.costPerHa)}
                unit=""
                highlight
                variant="warning"
              />
            </div>

            {result.totalCost !== null && result.totalLiters !== null && (
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard
                  label="Consumo total na área"
                  value={formatNumber(result.totalLiters, 0)}
                  unit="litros"
                  variant="default"
                />
                <ResultCard
                  label="Custo total de diesel"
                  value={formatCurrency(result.totalCost, 0)}
                  unit=""
                  variant="warning"
                />
              </div>
            )}

            {/* Reference table */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Consumo típico por operação
              </p>
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-1">Operação</th>
                    <th className="pb-1">Consumo (L/h)</th>
                  </tr>
                </thead>
                <tbody>
                  {CONSUMPTION_REFERENCE.map((row) => (
                    <tr key={row.operation} className="border-t border-gray-200">
                      <td className="py-1">{row.operation}</td>
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
        label="Operação"
        options={OPERATION_OPTIONS}
        value={inputs.operation}
        onChange={handleOperationChange}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Consumo do motor"
          unit="L/h"
          value={inputs.consumptionPerHour}
          onChange={(v) => updateInput('consumptionPerHour', v)}
          placeholder="ex: 28"
          step="0.5"
          required
        />
        <InputField
          label="Capacidade operacional"
          unit="ha/h"
          value={inputs.operationalCapacity}
          onChange={(v) => updateInput('operationalCapacity', v)}
          placeholder="ex: 5.5"
          step="0.1"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Preço do diesel"
          prefix="R$" unit="R$/L"
          value={inputs.dieselPrice}
          onChange={(v) => updateInput('dieselPrice', v)}
          placeholder="ex: 6.20"
          step="0.01"
          required
        />
        <InputField
          label="Área total"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v)}
          placeholder="ex: 1000 (opcional)"
          hint="Opcional — para calcular custo total"
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
