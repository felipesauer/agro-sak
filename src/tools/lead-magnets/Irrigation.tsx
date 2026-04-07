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
  soilType: string
  fieldCapacity: string
  wiltingPoint: string
  rootDepth: string
  precipitation: string
  tempMax: string
  tempMin: string
  tempMean: string
  irrigationSystem: string
  customKc: string
}

interface Result {
  eto: number
  etc: number
  kc: number
  netLamina: number
  grossLamina: number
  irrigationInterval: number
  pivotHours: number
  alert: string | null
}

const INITIAL: Inputs = {
  crop: 'soybean',
  phase: 'flowering',
  soilType: 'clay_loam',
  fieldCapacity: '100',
  wiltingPoint: '40',
  rootDepth: '0.6',
  precipitation: '0',
  tempMax: '34',
  tempMin: '22',
  tempMean: '28',
  irrigationSystem: 'pivot',
  customKc: '',
}

const CROP_OPTIONS = [...cropOptionsFrom(CROP_KC), { value: 'custom', label: '✦ Personalizado' }]

const PHASE_OPTIONS = [
  { value: 'initial', label: 'Germinação / Inicial' },
  { value: 'development', label: 'Desenvolvimento vegetativo' },
  { value: 'flowering', label: 'Floração / Intermediário' },
  { value: 'maturation', label: 'Maturação / Final' },
]

const SOIL_OPTIONS = [
  { value: 'sandy', label: 'Arenoso' },
  { value: 'clay_loam', label: 'Franco-argiloso' },
  { value: 'clay', label: 'Argiloso' },
]

const SYSTEM_OPTIONS = [
  { value: 'pivot', label: 'Pivô central' },
  { value: 'drip', label: 'Gotejamento' },
  { value: 'sprinkler', label: 'Aspersão convencional' },
]

// Kc by crop and phase
const KC: Record<string, Record<string, number>> = {
  soybean: { initial: 0.40, development: 0.85, flowering: 1.10, maturation: 0.50 },
  corn: { initial: 0.35, development: 0.80, flowering: 1.15, maturation: 0.60 },
  cotton: { initial: 0.35, development: 0.75, flowering: 1.15, maturation: 0.65 },
  bean: { initial: 0.40, development: 0.80, flowering: 1.10, maturation: 0.50 },
  wheat: { initial: 0.30, development: 0.75, flowering: 1.10, maturation: 0.40 },
  rice: { initial: 1.05, development: 1.10, flowering: 1.20, maturation: 0.90 },
  coffee: { initial: 0.90, development: 0.90, flowering: 0.95, maturation: 0.90 },
  sugarcane: { initial: 0.50, development: 0.80, flowering: 1.25, maturation: 0.75 },
}

// Irrigation system efficiency
const SYSTEM_EFFICIENCY: Record<string, number> = {
  pivot: 0.85,
  drip: 0.92,
  sprinkler: 0.70,
}

// Solar radiation approximation (Ra) in mm/day equivalent — simplified for tropical latitudes
const RA_TROPICAL = 15.0

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const tMax = parseFloat(inputs.tempMax)
  const tMin = parseFloat(inputs.tempMin)
  const tMean = parseFloat(inputs.tempMean)
  const cc = parseFloat(inputs.fieldCapacity)
  const pm = parseFloat(inputs.wiltingPoint)
  const rootDepth = parseFloat(inputs.rootDepth)
  const precip = parseFloat(inputs.precipitation) || 0
  const efficiency = SYSTEM_EFFICIENCY[inputs.irrigationSystem] ?? 0.85
  const kc = inputs.crop === 'custom'
    ? (parseFloat(inputs.customKc) || 1.0)
    : (KC[inputs.crop]?.[inputs.phase] ?? 1.0)

  // Hargreaves simplified ETo (mm/day)
  const tRange = Math.max(tMax - tMin, 0.1)
  const eto = 0.0023 * (tMean + 17.8) * Math.sqrt(tRange) * RA_TROPICAL

  // Crop ET
  const etc = eto * kc

  // Net irrigation lamina (mm) — irrigate at 50% available water
  const netLamina = (cc - pm) * rootDepth * 0.50

  // Gross lamina
  const grossLamina = netLamina / efficiency

  // Irrigation interval (days)
  const effectiveEtc = Math.max(etc - precip / 7, 0.1) // daily net demand
  const irrigationInterval = netLamina / effectiveEtc

  // Pivot run time (approximate: 6mm/h application rate for center pivots)
  const applicationRate = inputs.irrigationSystem === 'pivot' ? 6 : inputs.irrigationSystem === 'drip' ? 3 : 8
  const pivotHours = grossLamina / applicationRate

  // Alert for critical phases
  let alert: string | null = null
  if (inputs.phase === 'flowering' && precip < etc * 7 * 0.5) {
    alert = 'ATENÇÃO: Fase de floração com déficit hídrico! Risco máximo de perda de produtividade.'
  }

  return { eto, etc, kc, netLamina, grossLamina, irrigationInterval, pivotHours, alert }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.tempMax || !inputs.tempMin || !inputs.tempMean) return 'Informe as temperaturas'
  if (parseFloat(inputs.fieldCapacity) <= parseFloat(inputs.wiltingPoint)) return 'Capacidade de campo deve ser maior que ponto de murcha'
  if (isNaN(parseFloat(inputs.rootDepth)) || parseFloat(inputs.rootDepth) <= 0) return 'Profundidade radicular deve ser positiva'
  return null
}

// ── Component ──

export default function Irrigation() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Calculadora de Irrigação"
      description="Calcula a lâmina de irrigação e turno de rega com base na cultura, solo e condições climáticas."
      about="Calcule a lâmina de irrigação necessária (mm), o turno de rega e a estimativa de custo por hectare. Considere o tipo de solo, cultura, fase fenológica e sistema de irrigação."
      methodology="Lâmina líquida = (CC - PMP) × profundidade × fator de disponibilidade. Lâmina bruta = Lâmina líquida / Eficiência do sistema. Turno de rega = Lâmina / ETc diário. ETo por Hargreaves."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultCard label="ETo (ref.)" value={formatNumber(result.eto, 1)} unit="mm/dia" variant="default" />
              <ResultCard label={`ETc (Kc=${formatNumber(result.kc, 2)})`} value={formatNumber(result.etc, 1)} unit="mm/dia" variant="default" />
              <ResultCard label="Lâmina líquida" value={formatNumber(result.netLamina, 1)} unit="mm" highlight variant="default" />
              <ResultCard label="Lâmina bruta" value={formatNumber(result.grossLamina, 1)} unit="mm" highlight variant="default" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard label="Turno de rega" value={formatNumber(result.irrigationInterval, 1)} unit="dias" highlight variant="default" />
              <ResultCard label="Tempo de aplicação" value={formatNumber(result.pivotHours, 1)} unit="horas" variant="default" />
            </div>

            {result.alert && <AlertBanner variant="error" message={result.alert} />}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Tipo de solo" options={SOIL_OPTIONS} value={inputs.soilType} onChange={(v) => updateInput('soilType', v as never)} />
        <SelectField label="Sistema de irrigação" options={SYSTEM_OPTIONS} value={inputs.irrigationSystem} onChange={(v) => updateInput('irrigationSystem', v as never)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="Capacidade de campo" unit="mm/m" value={inputs.fieldCapacity} onChange={(v) => updateInput('fieldCapacity', v as never)} min="0" />
        <InputField label="Ponto de murcha" unit="mm/m" value={inputs.wiltingPoint} onChange={(v) => updateInput('wiltingPoint', v as never)} min="0" />
        <InputField label="Prof. radicular" unit="m" value={inputs.rootDepth} onChange={(v) => updateInput('rootDepth', v as never)} min="0" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="Temp. máxima" unit="°C" value={inputs.tempMax} onChange={(v) => updateInput('tempMax', v as never)} />
        <InputField label="Temp. mínima" unit="°C" value={inputs.tempMin} onChange={(v) => updateInput('tempMin', v as never)} />
        <InputField label="Temp. média" unit="°C" value={inputs.tempMean} onChange={(v) => updateInput('tempMean', v as never)} />
      </div>

      <InputField
        label="Precipitação última semana"
        unit="mm"
        value={inputs.precipitation}
        onChange={(v) => updateInput('precipitation', v as never)}
        min="0"
        placeholder="ex: 12"
      />

      {error && <AlertBanner variant="error" message={error} />}

      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
