import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'
import { calculateSprayMix, validateSprayMix, type SprayMixResult } from '../../core/utilities/spray-mix'

// ── Types ──

interface Inputs {
  tankVolume: string
  sprayVolume: string
  dosePerHa: string
  unit: string
}

const INITIAL: Inputs = {
  tankVolume: '3000',
  sprayVolume: '120',
  dosePerHa: '',
  unit: 'L',
}

// ── Calculation ──

function calculate(inputs: Inputs): SprayMixResult | null {
  return calculateSprayMix({
    tankVolumeLiters: parseFloat(inputs.tankVolume),
    sprayVolumeLPerHa: parseFloat(inputs.sprayVolume),
    dosePerHa: parseFloat(inputs.dosePerHa),
  })
}

function validate(inputs: Inputs): string | null {
  return validateSprayMix({
    tankVolumeLiters: parseFloat(inputs.tankVolume),
    sprayVolumeLPerHa: parseFloat(inputs.sprayVolume),
    dosePerHa: parseFloat(inputs.dosePerHa),
  })
}

const UNIT_MAP = {
  L: { small: 'mL', perHa: 'L/ha', full: 'L' },
  kg: { small: 'g', perHa: 'kg/ha', full: 'kg' },
} as const

// ── Component ──

export default function SprayMix() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, SprayMixResult>({ initialInputs: INITIAL, calculate, validate })

  const units = UNIT_MAP[inputs.unit as keyof typeof UNIT_MAP] ?? UNIT_MAP.L

  return (
    <CalculatorLayout
      title="Mistura de Calda — Dose por Tanque"
      description="Calcule a dose de um produto por tanque cheio, por 100L de calda e a área coberta por tanque."
      about="Calcule rapidamente a dose de produto por tanque para a pulverização. Informe a dose por hectare, o volume de calda e a capacidade do tanque."
      methodology="Dose por tanque = Dose/ha × (Volume do tanque / Volume de calda por ha). Hectares por tanque = Volume do tanque / Volume de calda por ha."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Por tanque cheio"
                value={formatNumber(result.perTank * 1000, 0)}
                unit={units.small}
                highlight
                variant="default"
              >
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(result.perTank, 2)} {units.full}
                </p>
              </ResultCard>
              <ResultCard
                label="Por 100L de calda"
                value={formatNumber(result.per100L * 1000, 0)}
                unit={units.small}
                variant="default"
              />
              <ResultCard
                label="Área por tanque"
                value={formatNumber(result.areaCoveredPerTank, 1)}
                unit="ha"
                variant="default"
              />
            </div>
            <AlertBanner
              variant="warning"
              message="Sempre calibre o pulverizador em campo antes da aplicação e siga as recomendações do fabricante do defensivo."
            />
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Volume do tanque"
          unit="L"
          value={inputs.tankVolume}
          onChange={(v) => updateInput('tankVolume', v)}
          placeholder="ex: 3000"
          min="0"
          required
          hint="Capacidade total do tanque do pulverizador"
        />
        <InputField
          label="Volume de calda desejado"
          unit="L/ha"
          value={inputs.sprayVolume}
          onChange={(v) => updateInput('sprayVolume', v)}
          placeholder="ex: 120"
          min="0"
          required
          hint="Volume recomendado na bula do produto"
        />
      </div>

      <InputField
        label="Dose do produto (conforme bula)"
        unit={units.perHa}
        value={inputs.dosePerHa}
        onChange={(v) => updateInput('dosePerHa', v)}
        placeholder="ex: 0.5"
        step="0.01"
        min="0"
        required
        hint="Consulte a bula para a dose por hectare"
      />

      <div className="flex gap-4 mt-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="unit"
            checked={inputs.unit === 'L'}
            onChange={() => updateInput('unit', 'L')}
            className="accent-agro-600"
          />
          Litros (L/ha)
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="unit"
            checked={inputs.unit === 'kg'}
            onChange={() => updateInput('unit', 'kg')}
            className="accent-agro-600"
          />
          Quilos (kg/ha)
        </label>
      </div>

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.tankVolume || !inputs.sprayVolume || !inputs.dosePerHa} />
    </CalculatorLayout>
  )
}
