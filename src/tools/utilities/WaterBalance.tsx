import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'
import { CROP_KC, cropOptionsFrom } from '../../data/reference-data'

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

interface Result {
  eto: number
  etc: number
  kc: number
  weeklyDemand: number
  weeklyBalance: number
  monthlyBalance: number
  irrigationLamina: number
  condition: string
  conditionVariant: 'info' | 'success' | 'warning' | 'error'
  recommendation: string
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

// Kc by crop and phase
const KC: Record<string, Record<string, number>> = {
  soybean: { vegetative: 0.80, flowering: 1.10, grain_fill: 1.00, maturation: 0.50 },
  corn: { vegetative: 0.75, flowering: 1.15, grain_fill: 1.05, maturation: 0.60 },
  cotton: { vegetative: 0.70, flowering: 1.15, grain_fill: 1.00, maturation: 0.65 },
  wheat: { vegetative: 0.70, flowering: 1.10, grain_fill: 1.00, maturation: 0.40 },
  bean: { vegetative: 0.75, flowering: 1.10, grain_fill: 0.95, maturation: 0.35 },
  rice: { vegetative: 1.05, flowering: 1.20, grain_fill: 1.10, maturation: 0.90 },
  coffee: { vegetative: 0.90, flowering: 0.95, grain_fill: 0.95, maturation: 0.90 },
  sugarcane: { vegetative: 0.60, flowering: 1.25, grain_fill: 1.10, maturation: 0.75 },
}

// Soil water retention factor (relative)
const SOIL_FACTOR: Record<string, number> = {
  sandy: 0.7,
  medium: 1.0,
  clay: 1.2,
}

// Simplified Ra for tropical latitudes (mm/day)
const RA = 15.0

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const tMean = parseFloat(inputs.tempMean)
  const tMax = parseFloat(inputs.tempMax)
  const tMin = parseFloat(inputs.tempMin)
  const precipWeek = parseFloat(inputs.precipWeek) || 0
  const precipMonth = parseFloat(inputs.precipMonth) || 0

  const kc = inputs.crop === 'custom'
    ? (parseFloat(inputs.customKc) || 1.0)
    : (KC[inputs.crop]?.[inputs.phase] ?? 1.0)
  const soilFactor = SOIL_FACTOR[inputs.soilTexture] ?? 1.0

  // Hargreaves ETo (mm/day)
  const tRange = Math.max(tMax - tMin, 0.1)
  const eto = 0.0023 * (tMean + 17.8) * Math.sqrt(tRange) * RA

  // Crop ET
  const etc = eto * kc

  // Weekly demand
  const weeklyDemand = etc * 7

  // Balance
  const weeklyBalance = precipWeek - weeklyDemand
  const monthlyBalance = precipMonth - etc * 30

  // Adjusted for soil retention
  const effectiveBalance = weeklyBalance * soilFactor

  // Condition
  let condition: string
  let conditionVariant: 'info' | 'success' | 'warning' | 'error'
  let recommendation: string

  if (effectiveBalance >= 10) {
    condition = 'Excesso hídrico'
    conditionVariant = 'info'
    recommendation = 'Solo pode estar saturado. Verifique drenagem e aeração.'
  } else if (effectiveBalance >= -5) {
    condition = 'Adequado'
    conditionVariant = 'success'
    recommendation = 'Balanço hídrico dentro do ideal. Manter monitoramento.'
  } else if (effectiveBalance >= -20) {
    condition = 'Déficit leve'
    conditionVariant = 'warning'
    recommendation = 'Atenção: iniciar irrigação se possível. Monitorar previsão do tempo.'
  } else {
    condition = 'Déficit severo'
    conditionVariant = 'error'
    recommendation = 'Irrigação urgente! Risco alto de perda de produtividade.'
  }

  // Phase-specific alert
  if (inputs.phase === 'flowering' && effectiveBalance < -5) {
    condition = 'Déficit CRÍTICO (Floração)'
    conditionVariant = 'error'
    recommendation = 'ALERTA MÁXIMO: Floração com déficit hídrico causa perda irreversível de produtividade. Irrigar imediatamente!'
  }

  // Irrigation lamina: how much water to apply (mm) to cover the deficit
  // Only meaningful when there's a deficit (negative balance)
  const irrigationLamina = effectiveBalance < 0 ? Math.abs(effectiveBalance) : 0

  return {
    eto,
    etc,
    kc,
    weeklyDemand,
    weeklyBalance,
    monthlyBalance,
    irrigationLamina,
    condition,
    conditionVariant,
    recommendation,
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.tempMean || !inputs.tempMax || !inputs.tempMin) return 'Informe as temperaturas'
  if (parseFloat(inputs.tempMax) < parseFloat(inputs.tempMin)) return 'Temperatura máxima deve ser maior que a mínima'
  if (!inputs.precipWeek && !inputs.precipMonth) return 'Informe ao menos a precipitação da semana'
  return null
}

// ── Component ──

export default function WaterBalance() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

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
