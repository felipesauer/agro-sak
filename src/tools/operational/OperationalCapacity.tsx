import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  workWidth: string
  speed: string
  efficiency: string
  area: string
  hoursPerDay: string
}

interface Result {
  haPerHour: number
  hoursNeeded: number | null
  daysNeeded: number | null
}

const INITIAL: Inputs = {
  workWidth: '12',
  speed: '6',
  efficiency: '75',
  area: '',
  hoursPerDay: '10',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const width = parseFloat(inputs.workWidth)
  const speed = parseFloat(inputs.speed)
  const eff = parseFloat(inputs.efficiency)

  // Cap. Operacional (ha/h) = (Largura × Velocidade × Eficiência/100) / 10
  const haPerHour = (width * speed * (eff / 100)) / 10

  const area = parseFloat(inputs.area) || 0
  const hpd = parseFloat(inputs.hoursPerDay) || 0

  const hoursNeeded = area > 0 ? area / haPerHour : null
  const daysNeeded = hoursNeeded !== null && hpd > 0 ? hoursNeeded / hpd : null

  return { haPerHour, hoursNeeded, daysNeeded }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.workWidth) return 'Informe a largura de trabalho'
  if (!inputs.speed) return 'Informe a velocidade de trabalho'
  if (!inputs.efficiency) return 'Informe a eficiência operacional'
  const eff = parseFloat(inputs.efficiency)
  if (eff <= 0 || eff > 100) return 'Eficiência deve estar entre 1% e 100%'
  return null
}

// ── Reference data ──

const EFFICIENCY_REFERENCE = [
  { operation: 'Plantadeira', range: '70 – 80%' },
  { operation: 'Pulverizador', range: '75 – 85%' },
  { operation: 'Colheitadeira', range: '65 – 75%' },
  { operation: 'Grade aradora', range: '70 – 80%' },
  { operation: 'Subsolador', range: '65 – 75%' },
]

// ── Component ──

export default function OperationalCapacity() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Capacidade Operacional"
      description="Calcule quantos hectares por hora uma máquina cobre e o tempo necessário para a operação."
      about="Calcule quantos hectares a máquina cobre por hora e quanto tempo levará para completar toda a área. Fundamental para dimensionar a frota e planejar as operações na janela disponível."
      methodology="Capacidade operacional (ha/h) = (Largura × Velocidade × Eficiência) / 10. Tempo total = Área / Capacidade operacional."
      result={
        result && (
          <div className="space-y-4">
            <ResultCard
              label="Capacidade operacional"
              value={formatNumber(result.haPerHour, 2)}
              unit="ha/h"
              highlight
              variant="default"
            />

            {result.hoursNeeded !== null && (
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard
                  label="Horas para cobrir a área"
                  value={formatNumber(result.hoursNeeded, 1)}
                  unit="horas"
                  variant="default"
                />
                {result.daysNeeded !== null && (
                  <ResultCard
                    label="Dias necessários"
                    value={formatNumber(Math.ceil(result.daysNeeded), 0)}
                    unit="dias"
                    variant="default"
                  >
                    <p className="text-xs text-gray-500 mt-1">
                      ({formatNumber(result.daysNeeded, 1)} dias exatos)
                    </p>
                  </ResultCard>
                )}
              </div>
            )}

            {/* Reference table */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Eficiências típicas por operação
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-1">Operação</th>
                    <th className="pb-1">Eficiência</th>
                  </tr>
                </thead>
                <tbody>
                  {EFFICIENCY_REFERENCE.map((row) => (
                    <tr key={row.operation} className="border-t border-gray-200">
                      <td className="py-1">{row.operation}</td>
                      <td className="py-1">{row.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Largura de trabalho"
          unit="m"
          value={inputs.workWidth}
          onChange={(v) => updateInput('workWidth', v)}
          placeholder="ex: 12"
          step="0.5"
          required
        />
        <InputField
          label="Velocidade de trabalho"
          unit="km/h"
          value={inputs.speed}
          onChange={(v) => updateInput('speed', v)}
          placeholder="ex: 6"
          step="0.5"
          required
        />
        <InputField
          label="Eficiência operacional"
          unit="%"
          value={inputs.efficiency}
          onChange={(v) => updateInput('efficiency', v)}
          placeholder="ex: 75"
          step="1"
          min="1"
          max="100"
          required
          hint="Tempo efetivo / tempo total em campo"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Área total"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v)}
          placeholder="ex: 500 (opcional)"
          hint="Opcional — para calcular tempo necessário"
        />
        <InputField
          label="Horas de trabalho por dia"
          unit="h/dia"
          value={inputs.hoursPerDay}
          onChange={(v) => updateInput('hoursPerDay', v)}
          placeholder="ex: 10"
          hint="Opcional — para calcular dias necessários"
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
