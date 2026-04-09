import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'
import { CROP_KC, cropOptionsFrom } from '../../data/reference-data'
import { calculateIrrigation, validateIrrigation, type IrrigationResult } from '../../core/agronomic/irrigation'

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

// ── Calculation ──

function calculate(inputs: Inputs): IrrigationResult | null {
  return calculateIrrigation({
    crop: inputs.crop,
    phase: inputs.phase,
    fieldCapacity: parseFloat(inputs.fieldCapacity),
    wiltingPoint: parseFloat(inputs.wiltingPoint),
    rootDepth: parseFloat(inputs.rootDepth),
    precipitationMm: parseFloat(inputs.precipitation) || 0,
    tempMax: parseFloat(inputs.tempMax),
    tempMin: parseFloat(inputs.tempMin),
    tempMean: parseFloat(inputs.tempMean),
    irrigationSystem: inputs.irrigationSystem,
    customKc: inputs.crop === 'custom' ? parseFloat(inputs.customKc) || undefined : undefined,
  })
}

function validate(inputs: Inputs): string | null {
  return validateIrrigation({
    crop: inputs.crop,
    phase: inputs.phase,
    fieldCapacity: parseFloat(inputs.fieldCapacity),
    wiltingPoint: parseFloat(inputs.wiltingPoint),
    rootDepth: parseFloat(inputs.rootDepth),
    precipitationMm: parseFloat(inputs.precipitation) || 0,
    tempMax: parseFloat(inputs.tempMax),
    tempMin: parseFloat(inputs.tempMin),
    tempMean: parseFloat(inputs.tempMean),
    irrigationSystem: inputs.irrigationSystem,
    customKc: inputs.crop === 'custom' ? parseFloat(inputs.customKc) || undefined : undefined,
  })
}

// ── Component ──

export default function Irrigation() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, IrrigationResult>({ initialInputs: INITIAL, calculate, validate })

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
              <ResultCard label="Tempo de aplicação" value={formatNumber(result.applicationHours, 1)} unit="horas" variant="default" />
            </div>

            {result.alert && <AlertBanner variant="error" message={result.alert} />}
            <AlertBanner
              variant="info"
              message="Acompanhe a precipitação diária e subtraia da lâmina calculada para evitar excesso de irrigação."
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

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Tipo de solo" options={SOIL_OPTIONS} value={inputs.soilType} onChange={(v) => updateInput('soilType', v as never)} />
        <SelectField label="Sistema de irrigação" options={SYSTEM_OPTIONS} value={inputs.irrigationSystem} onChange={(v) => updateInput('irrigationSystem', v as never)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="Capacidade de campo" unit="mm/m" value={inputs.fieldCapacity} onChange={(v) => updateInput('fieldCapacity', v as never)} min="0" hint="Capacidade de retenção de água do solo" />
        <InputField label="Ponto de murcha" unit="mm/m" value={inputs.wiltingPoint} onChange={(v) => updateInput('wiltingPoint', v as never)} min="0" hint="Ponto de murcha permanente do solo" />
        <InputField label="Prof. radicular" unit="m" value={inputs.rootDepth} onChange={(v) => updateInput('rootDepth', v as never)} min="0" hint="Profundidade efetiva das raízes" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="Temp. máxima" unit="°C" value={inputs.tempMax} onChange={(v) => updateInput('tempMax', v as never)} hint="Temperatura máxima do dia" />
        <InputField label="Temp. mínima" unit="°C" value={inputs.tempMin} onChange={(v) => updateInput('tempMin', v as never)} hint="Temperatura mínima do dia" />
        <InputField label="Temp. média" unit="°C" value={inputs.tempMean} onChange={(v) => updateInput('tempMean', v as never)} hint="Temperatura média diária" />
      </div>

      <InputField
        label="Precipitação última semana"
        unit="mm"
        value={inputs.precipitation}
        onChange={(v) => updateInput('precipitation', v as never)}
        min="0"
        placeholder="ex: 12"
        hint="Chuva acumulada nos últimos 7 dias"
      />

      {error && <AlertBanner variant="error" message={error} />}

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.tempMax || !inputs.tempMin || !inputs.tempMean} />
    </CalculatorLayout>
  )
}
