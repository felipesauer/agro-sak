import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  sprayerType: string
  nozzleCount: string
  flowPerNozzle: string
  speed: string
  nozzleSpacing: string
  tankCapacity: string
  dosePerHa: string
  doseUnit: string
}

interface Result {
  sprayVolume: number
  areaCoveredPerTank: number
  productPerTank: number | null
  volumeAlert: string | null
}

const SPRAYER_OPTIONS = [
  { value: 'self-propelled', label: 'Autopropelido' },
  { value: 'tractor', label: 'Tratorizado' },
  { value: 'backpack', label: 'Costal' },
]

const DOSE_UNIT_OPTIONS = [
  { value: 'L', label: 'L/ha' },
  { value: 'kg', label: 'kg/ha' },
]

const INITIAL: Inputs = {
  sprayerType: 'self-propelled',
  nozzleCount: '36',
  flowPerNozzle: '0.80',
  speed: '18',
  nozzleSpacing: '0.50',
  tankCapacity: '3000',
  dosePerHa: '',
  doseUnit: 'L',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const flow = parseFloat(inputs.flowPerNozzle)
  const speed = parseFloat(inputs.speed)
  const spacing = parseFloat(inputs.nozzleSpacing)
  const tankCap = parseFloat(inputs.tankCapacity)
  const dosePerHa = parseFloat(inputs.dosePerHa) || 0

  // Volume de calda (L/ha) = (Vazão_bico × 600) / (Velocidade × Espaçamento)
  const sprayVolume = (flow * 600) / (speed * spacing)

  // Área coberta por tanque
  const areaCoveredPerTank = tankCap / sprayVolume

  // Produto por tanque
  const productPerTank = dosePerHa > 0 ? dosePerHa * areaCoveredPerTank : null

  // Alerts
  let volumeAlert: string | null = null
  if (sprayVolume < 50)
    volumeAlert = 'Volume abaixo de 50 L/ha — risco de deriva e cobertura insuficiente.'
  else if (sprayVolume > 400)
    volumeAlert = 'Volume acima de 400 L/ha — impraticável para a maioria das operações.'

  return { sprayVolume, areaCoveredPerTank, productPerTank, volumeAlert }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.flowPerNozzle) return 'Informe a vazão por bico'
  if (!inputs.speed) return 'Informe a velocidade de aplicação'
  if (!inputs.nozzleSpacing) return 'Informe o espaçamento entre bicos'
  if (!inputs.tankCapacity) return 'Informe a capacidade do tanque'
  if (parseFloat(inputs.speed) <= 0) return 'Velocidade deve ser positiva'
  if (parseFloat(inputs.nozzleSpacing) <= 0) return 'Espaçamento deve ser positivo'
  return null
}

// ── Reference table data ──

const VOLUME_REFERENCE = [
  { droplet: 'Gotas finas', range: '50 – 100 L/ha' },
  { droplet: 'Gotas médias', range: '100 – 200 L/ha' },
  { droplet: 'Gotas grossas', range: '150 – 300 L/ha' },
]

// ── Component ──

export default function SprayerCalibration() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Calibração de Pulverizador"
      description="Calcule o volume de calda (L/ha), a área coberta por tanque e a quantidade de produto por tanque."
      about="Calibre o pulverizador para garantir a dose correta de defensivos por hectare. Um pulverizador mal calibrado desperdiça produto, aumenta custo e pode comprometer a eficácia."
      methodology="Volume de calda (L/ha) = (Vazão total × 600) / Velocidade × Largura efetiva. Área por tanque = Volume do tanque / Volume de calda por ha."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Volume de calda"
                value={formatNumber(result.sprayVolume, 1)}
                unit="L/ha"
                highlight
                variant="default"
              />
              <ResultCard
                label="Área por tanque"
                value={formatNumber(result.areaCoveredPerTank, 2)}
                unit="ha"
                highlight
                variant="default"
              />
            </div>

            {result.productPerTank !== null && (
              <ResultCard
                label="Produto por tanque"
                value={formatNumber(result.productPerTank, 2)}
                unit={inputs.doseUnit === 'L' ? 'L' : 'kg'}
                variant="default"
              />
            )}

            {result.volumeAlert && (
              <AlertBanner variant="warning" message={result.volumeAlert} />
            )}

            {/* Reference table */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Volume recomendado por tipo de gota
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-1">Tipo de gota</th>
                    <th className="pb-1">Volume (L/ha)</th>
                  </tr>
                </thead>
                <tbody>
                  {VOLUME_REFERENCE.map((row) => (
                    <tr key={row.droplet} className="border-t border-gray-200">
                      <td className="py-1">{row.droplet}</td>
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
      <SelectField
        label="Tipo de pulverizador"
        options={SPRAYER_OPTIONS}
        value={inputs.sprayerType}
        onChange={(v) => updateInput('sprayerType', v)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Número de bicos"
          value={inputs.nozzleCount}
          onChange={(v) => updateInput('nozzleCount', v)}
          placeholder="ex: 36"
        />
        <InputField
          label="Vazão por bico"
          unit="L/min"
          value={inputs.flowPerNozzle}
          onChange={(v) => updateInput('flowPerNozzle', v)}
          placeholder="ex: 0.80"
          step="0.01"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Velocidade de aplicação"
          unit="km/h"
          value={inputs.speed}
          onChange={(v) => updateInput('speed', v)}
          placeholder="ex: 18"
          step="0.5"
          required
        />
        <InputField
          label="Espaçamento entre bicos"
          unit="m"
          value={inputs.nozzleSpacing}
          onChange={(v) => updateInput('nozzleSpacing', v)}
          placeholder="ex: 0.50"
          step="0.01"
          required
        />
      </div>

      <InputField
        label="Capacidade do tanque"
        unit="L"
        value={inputs.tankCapacity}
        onChange={(v) => updateInput('tankCapacity', v)}
        placeholder="ex: 3000"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Dose do produto por hectare"
          unit={inputs.doseUnit === 'L' ? 'L/ha' : 'kg/ha'}
          value={inputs.dosePerHa}
          onChange={(v) => updateInput('dosePerHa', v)}
          placeholder="ex: 2.5 (opcional)"
          step="0.01"
          hint="Opcional — para calcular a quantidade por tanque"
        />
        <SelectField
          label="Unidade da dose"
          options={DOSE_UNIT_OPTIONS}
          value={inputs.doseUnit}
          onChange={(v) => updateInput('doseUnit', v)}
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
