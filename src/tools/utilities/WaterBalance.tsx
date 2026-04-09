import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'
import { CROP_KC, cropOptionsFrom } from '../../data/reference-data'
import { calculateWaterBalance, validateWaterBalance, type WaterBalanceResult } from '../../core/agronomic/water-balance'

// ── Types ──

interface Inputs {
  crop: string
  phase: string
  soilTexture: string
  precipWeek: string
  precipMonth: string
  tempMean: string
  tempMax: string
  tempMin: string
  customKc: string
}

const INITIAL: Inputs = {
  crop: 'soybean',
  phase: 'flowering',
  soilTexture: 'medium',
  precipWeek: '',
  precipMonth: '',
  tempMean: '28',
  tempMax: '34',
  tempMin: '22',
  customKc: '',
}

const CROP_OPTIONS = [...cropOptionsFrom(CROP_KC), { value: 'custom', label: '✦ Personalizado' }]

const PHASE_OPTIONS = [
  { value: 'vegetative', label: 'Vegetativa' },
  { value: 'flowering', label: 'Floração' },
  { value: 'grain_fill', label: 'Enchimento de grãos' },
  { value: 'maturation', label: 'Maturação' },
]

const SOIL_OPTIONS = [
  { value: 'sandy', label: 'Arenoso' },
  { value: 'medium', label: 'Médio (franco)' },
  { value: 'clay', label: 'Argiloso' },
]

// ── Calculation ──

function buildCoreInput(inputs: Inputs) {
  return {
    crop: inputs.crop,
    phase: inputs.phase,
    soilTexture: inputs.soilTexture,
    precipWeekMm: parseFloat(inputs.precipWeek) || 0,
    precipMonthMm: parseFloat(inputs.precipMonth) || 0,
    tempMean: parseFloat(inputs.tempMean),
    tempMax: parseFloat(inputs.tempMax),
    tempMin: parseFloat(inputs.tempMin),
    customKc: inputs.crop === 'custom' ? parseFloat(inputs.customKc) || undefined : undefined,
  }
}

function calculate(inputs: Inputs): WaterBalanceResult | null {
  return calculateWaterBalance(buildCoreInput(inputs))
}

function validate(inputs: Inputs): string | null {
  return validateWaterBalance(buildCoreInput(inputs))
}

// ── Component ──

export default function WaterBalance() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, WaterBalanceResult>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Balanço Hídrico"
      description="Monitore o balanço hídrico da lavoura comparando precipitação com evapotranspiração estimada. Método Hargreaves simplificado."
      about="Monitore o balanço hídrico da lavoura: compare a chuva recebida com a demanda da cultura (ETc). Identifique déficit ou excesso hídrico para tomar decisões de irrigação."
      methodology="ETc = ETo × Kc (coeficiente da cultura por fase). ETo estimada por Hargreaves: 0,0023 × Ra × (Tmed + 17,8) × √(Tmax - Tmin). Balanço = Precipitação - ETc. Ra fixo em 15 mm/dia (aproximação para latitudes tropicais entre 10°S e 25°S)."
      result={
        result && (
          <div className="space-y-4">
            <AlertBanner variant={result.conditionVariant} message={`${result.condition}: ${result.recommendation}`} />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ResultCard label="ETo (referência)" value={formatNumber(result.eto, 1)} unit="mm/dia" variant="default" />
              <ResultCard label={`ETc (Kc=${formatNumber(result.kc, 2)})`} value={formatNumber(result.etc, 1)} unit="mm/dia" variant="default" />
              <ResultCard label="Demanda semanal" value={formatNumber(result.weeklyDemand, 1)} unit="mm/semana" variant="default" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ResultCard
                label="Balanço semanal"
                value={formatNumber(result.weeklyBalance, 1)}
                unit="mm"
                highlight
                variant={result.weeklyBalance >= 0 ? 'success' : 'danger'}
              />
              <ResultCard
                label="Balanço mensal (estimado)"
                value={formatNumber(result.monthlyBalance, 1)}
                unit="mm"
                variant={result.monthlyBalance >= 0 ? 'success' : 'danger'}
              />
              {result.irrigationLamina > 0 && (
                <ResultCard
                  label="Lâmina de irrigação"
                  value={formatNumber(result.irrigationLamina, 1)}
                  unit="mm/semana"
                  highlight
                  variant="danger"
                />
              )}
            </div>

            {result.irrigationLamina > 0 && (
              <AlertBanner
                variant="warning"
                message={`Recomendação: aplique aproximadamente ${formatNumber(result.irrigationLamina, 1)} mm de irrigação nesta semana para cobrir o déficit hídrico (${formatNumber(result.irrigationLamina / 7, 1)} mm/dia). Ajuste conforme eficiência do sistema de irrigação (pivô ~85%, aspersão ~75%, gotejo ~95%).`}
              />
            )}

            {/* Visual bar */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Balanço semanal</p>
              <div className="flex items-center gap-2">
                <span className="text-xs w-16 text-right">Déficit</span>
                <div className="flex-1 bg-gray-200 rounded h-4 relative overflow-hidden">
                  {result.weeklyBalance >= 0 ? (
                    <div
                      className="bg-blue-500 h-full rounded-r"
                      style={{
                        width: `${Math.min((result.weeklyBalance / result.weeklyDemand) * 50, 50)}%`,
                        marginLeft: '50%',
                      }}
                    />
                  ) : (
                    <div
                      className="bg-red-500 h-full rounded-l absolute right-1/2"
                      style={{
                        width: `${Math.min((Math.abs(result.weeklyBalance) / result.weeklyDemand) * 50, 50)}%`,
                      }}
                    />
                  )}
                  <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-600" />
                </div>
                <span className="text-xs w-16">Excesso</span>
              </div>
            </div>

            <AlertBanner
              variant="info"
              message="ETo calculada com Ra fixo de 15 mm/dia (aproximação para latitudes tropicais). Para maior precisão, use dados de estação meteorológica local."
            />
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Cultura" options={CROP_OPTIONS} value={inputs.crop} onChange={(v) => updateInput('crop', v as never)} />
        {inputs.crop === 'custom' ? (
          <InputField label="Kc (coef. da cultura)" value={inputs.customKc} onChange={(v) => updateInput('customKc', v as never)} placeholder="ex: 1.10" step="0.01" hint="Informe o Kc para sua cultura/fase" />
        ) : (
          <SelectField label="Fase fenológica" options={PHASE_OPTIONS} value={inputs.phase} onChange={(v) => updateInput('phase', v as never)} />
        )}
      </div>

      <SelectField label="Textura do solo" options={SOIL_OPTIONS} value={inputs.soilTexture} onChange={(v) => updateInput('soilTexture', v as never)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Precipitação da semana" unit="mm" value={inputs.precipWeek} onChange={(v) => updateInput('precipWeek', v as never)} min="0" placeholder="ex: 45" hint="Chuva acumulada nos últimos 7 dias" />
        <InputField label="Precipitação acumulada no mês" unit="mm" value={inputs.precipMonth} onChange={(v) => updateInput('precipMonth', v as never)} min="0" placeholder="ex: 120" hint="Chuva acumulada no mês corrente" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="Temp. média" unit="°C" value={inputs.tempMean} onChange={(v) => updateInput('tempMean', v as never)} hint="Temperatura média diária" />
        <InputField label="Temp. máxima" unit="°C" value={inputs.tempMax} onChange={(v) => updateInput('tempMax', v as never)} hint="Temperatura máxima do dia" />
        <InputField label="Temp. mínima" unit="°C" value={inputs.tempMin} onChange={(v) => updateInput('tempMin', v as never)} hint="Temperatura mínima do dia" />
      </div>

      {error && <AlertBanner variant="error" message={error} />}

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.tempMean || !inputs.tempMax || !inputs.tempMin} />
    </CalculatorLayout>
  )
}
