import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { calculateRainVolume, validateRainVolume, type RainVolumeResult } from '../../core/utilities/rain-volume'

// ── Types ──

interface Inputs {
  rainMm: string
  area: string
  pricePerCubicMeter: string
}

// ── Constants ──

const INITIAL: Inputs = {
  rainMm: '',
  area: '',
  pricePerCubicMeter: '',
}

// ── Component ──

export default function RainVolume() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, RainVolumeResult>({
      initialInputs: INITIAL,
      calculate,
      validate,
    })

  return (
    <CalculatorLayout
      title="Volume de Chuva"
      description="Converta mm de chuva para litros por hectare, volume total e custo equivalente de irrigação."
      about="Uma chuva de 1 mm sobre 1 hectare equivale a 10.000 litros (10 m³). Essa conversão é fundamental para planejar irrigação, dimensionar reservatórios e avaliar o valor econômico de cada precipitação."
      methodology="Cálculo direto: Volume (L) = mm × 10.000 × Área (ha). Referência: EMBRAPA — 1 mm = 1 L/m² = 10 m³/ha."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Litros por hectare"
                value={formatNumber(result.litersPerHa, 0)}
                unit="L/ha"
                highlight
              />
              <ResultCard
                label="Volume total"
                value={formatNumber(result.totalCubicMeters, 1)}
                unit="m³"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Total em litros"
                value={formatNumber(result.totalLiters, 0)}
                unit="litros"
              />
              {result.equivalentCost > 0 && (
                <ResultCard
                  label="Custo equivalente em irrigação"
                  value={formatCurrency(result.equivalentCost)}
                  variant="success"
                />
              )}
            </div>

            {result.alerts.map((a) => (
              <AlertBanner key={a} variant="info" message={a} />
            ))}
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Precipitação"
          unit="mm"
          value={inputs.rainMm}
          onChange={(v) => updateInput('rainMm', v as never)}
          placeholder="Ex: 30"
          min="0"
          step="0.1"
          required
          hint="Chuva medida no pluviômetro"
        />
        <InputField
          label="Área"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v as never)}
          placeholder="Ex: 100"
          min="0"
          step="0.1"
          required
          hint="Área do talhão ou propriedade"
        />
      </div>

      <InputField
        label="Custo da água irrigada"
        unit="R$/m³"
        value={inputs.pricePerCubicMeter}
        onChange={(v) => updateInput('pricePerCubicMeter', v as never)}
        placeholder="Ex: 0.12"
        min="0"
        step="0.01"
        hint="Opcional — para estimar valor econômico da chuva"
      />

      {error && <AlertBanner variant="error" message={error} />}

      <ActionButtons
        onCalculate={run}
        onClear={clear}
        disabled={!inputs.rainMm || !inputs.area}
      />
    </CalculatorLayout>
  )
}

// ── Logic ──

function validate(inputs: Inputs): string | null {
  return validateRainVolume({
    rainMm: parseFloat(inputs.rainMm),
    areaHa: parseFloat(inputs.area),
    pricePerCubicMeter: parseFloat(inputs.pricePerCubicMeter) || undefined,
  })
}

function calculate(inputs: Inputs): RainVolumeResult {
  const price = parseFloat(inputs.pricePerCubicMeter) || 0
  const result = calculateRainVolume({
    rainMm: parseFloat(inputs.rainMm),
    areaHa: parseFloat(inputs.area),
    pricePerCubicMeter: price,
  })

  // Extra UI alert for economic equivalent (not in core)
  if (price > 0) {
    result.alerts.push(`Essa chuva equivale economicamente a ${formatCurrency(result.equivalentCost)} em irrigação.`)
  }

  return result
}
