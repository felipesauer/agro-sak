import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  area: string
  crop: string
  irrigationSystem: string
  soilType: string
  et0: string
  kc: string
  efficiency: string
  distance: string
  pumpPower: string
  electricityCost: string
  hoursPerDay: string
}

interface Result {
  dailyWaterNeed: number
  monthlyWaterNeed: number
  dailyEnergyCost: number
  monthlyEnergyCost: number
  costPerMm: number
  costPerHa: number
  dailyLamina: number
}

const CROP_OPTIONS = [
  { value: 'soybean', label: 'Soja' },
  { value: 'corn', label: 'Milho' },
  { value: 'cotton', label: 'Algodão' },
  { value: 'coffee', label: 'Café' },
  { value: 'sugarcane', label: 'Cana-de-açúcar' },
  { value: 'beans', label: 'Feijão' },
  { value: 'wheat', label: 'Trigo' },
  { value: 'pasture', label: 'Pastagem' },
]

const IRRIGATION_OPTIONS = [
  { value: 'pivot', label: 'Pivô central' },
  { value: 'drip', label: 'Gotejamento' },
  { value: 'sprinkler', label: 'Aspersão convencional' },
  { value: 'flood', label: 'Inundação / Sulco' },
]

const SOIL_OPTIONS = [
  { value: 'sandy', label: 'Arenoso' },
  { value: 'medium', label: 'Médio / Franco' },
  { value: 'clay', label: 'Argiloso' },
]

const INITIAL: Inputs = {
  area: '100',
  crop: 'soybean',
  irrigationSystem: 'pivot',
  soilType: 'medium',
  et0: '5.0',
  kc: '1.1',
  efficiency: '85',
  distance: '0.5',
  pumpPower: '75',
  electricityCost: '0.85',
  hoursPerDay: '18',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const area = parseFloat(inputs.area)
  const et0 = parseFloat(inputs.et0)
  const kc = parseFloat(inputs.kc)
  const efficiency = parseFloat(inputs.efficiency) / 100
  const pumpPower = parseFloat(inputs.pumpPower)
  const electricityCost = parseFloat(inputs.electricityCost)
  const hoursPerDay = parseFloat(inputs.hoursPerDay)

  // ETc = ET0 × Kc (mm/day)
  const etc = et0 * kc

  // Lamina needed considering efficiency (mm/day)
  const dailyLamina = efficiency > 0 ? etc / efficiency : etc

  // Volume: 1 mm on 1 ha = 10 m³
  const dailyWaterNeed = dailyLamina * area * 10 // m³/day
  const monthlyWaterNeed = dailyWaterNeed * 30

  // Energy cost: 1 cv = 0.7355 kW
  const pumpKw = pumpPower * 0.7355
  const dailyEnergyKwh = pumpKw * hoursPerDay
  const dailyEnergyCost = dailyEnergyKwh * electricityCost
  const monthlyEnergyCost = dailyEnergyCost * 30

  // Cost per mm applied across entire area
  const costPerMm = dailyLamina > 0 ? dailyEnergyCost / dailyLamina : 0

  // Cost per hectare per month
  const costPerHa = area > 0 ? monthlyEnergyCost / area : 0

  return {
    dailyWaterNeed,
    monthlyWaterNeed,
    dailyEnergyCost,
    monthlyEnergyCost,
    costPerMm,
    costPerHa,
    dailyLamina,
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.area || parseFloat(inputs.area) <= 0) return 'Informe a área'
  if (!inputs.et0 || parseFloat(inputs.et0) <= 0) return 'Informe a ET0'
  if (!inputs.kc || parseFloat(inputs.kc) <= 0) return 'Informe o Kc'
  if (!inputs.efficiency || parseFloat(inputs.efficiency) <= 0 || parseFloat(inputs.efficiency) > 100)
    return 'Eficiência deve ser entre 1 e 100%'
  if (!inputs.pumpPower || parseFloat(inputs.pumpPower) <= 0) return 'Informe a potência da bomba'
  if (!inputs.electricityCost || parseFloat(inputs.electricityCost) <= 0) return 'Informe o custo da energia'
  return null
}

// ── Component ──

export default function WaterConsumption() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Consumo de Água"
      description="Calcule o consumo de água para irrigação e o custo energético da operação."
      about="Estime o volume diário e mensal de água para irrigação, considerando a demanda da cultura (ETc), eficiência do sistema e custo de energia. Essencial para planejamento hídrico e orçamentário."
      methodology="ETc = ET0 × Kc. Lâmina bruta = ETc / Eficiência. Volume (m³) = Lâmina (mm) × Área (ha) × 10. Energia = Potência (cv) × 0,7355 × Horas × Custo kWh."
      result={
        result && (
          <div className="space-y-4">
            <ResultCard
              label="Lâmina diária necessária"
              value={formatNumber(result.dailyLamina, 1)}
              unit="mm/dia"
              highlight
              variant="warning"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Volume diário"
                value={formatNumber(result.dailyWaterNeed, 0)}
                unit="m³/dia"
              />
              <ResultCard
                label="Volume mensal"
                value={formatNumber(result.monthlyWaterNeed, 0)}
                unit="m³/mês"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Custo energia/dia"
                value={formatCurrency(result.dailyEnergyCost)}
                unit="/dia"
              />
              <ResultCard
                label="Custo energia/mês"
                value={formatCurrency(result.monthlyEnergyCost)}
                unit="/mês"
                highlight
                variant="warning"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Custo por mm aplicado"
                value={formatCurrency(result.costPerMm)}
                unit="/mm"
              />
              <ResultCard
                label="Custo por hectare/mês"
                value={formatCurrency(result.costPerHa)}
                unit="/ha/mês"
              />
            </div>

            <AlertBanner
              variant="info"
              message={`Para irrigar ${inputs.area} ha com ${formatNumber(result.dailyLamina, 1)} mm/dia, são necessários ${formatNumber(result.dailyWaterNeed, 0)} m³ de água diariamente.`}
            />
          </div>
        )
      }
    >
      <InputField
        label="Área irrigada"
        unit="ha"
        value={inputs.area}
        onChange={(v) => updateInput('area', v)}
        placeholder="ex: 100"
        hint="Área total sob irrigação"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Cultura"
          options={CROP_OPTIONS}
          value={inputs.crop}
          onChange={(v) => updateInput('crop', v)}
        />
        <SelectField
          label="Sistema de irrigação"
          options={IRRIGATION_OPTIONS}
          value={inputs.irrigationSystem}
          onChange={(v) => updateInput('irrigationSystem', v)}
        />
      </div>

      <SelectField
        label="Tipo de solo"
        options={SOIL_OPTIONS}
        value={inputs.soilType}
        onChange={(v) => updateInput('soilType', v)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="ET0 (evapotranspiração)"
          unit="mm/dia"
          value={inputs.et0}
          onChange={(v) => updateInput('et0', v)}
          placeholder="ex: 5.0"
          hint="Evapotranspiração de referência da região"
        />
        <InputField
          label="Coeficiente de cultura (Kc)"
          value={inputs.kc}
          onChange={(v) => updateInput('kc', v)}
          placeholder="ex: 1.1"
          hint="Kc da cultura no estágio atual"
        />
      </div>

      <InputField
        label="Eficiência do sistema"
        unit="%"
        value={inputs.efficiency}
        onChange={(v) => updateInput('efficiency', v)}
        placeholder="ex: 85"
        hint="Eficiência de aplicação do sistema de irrigação"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Distância da fonte de água"
          unit="km"
          value={inputs.distance}
          onChange={(v) => updateInput('distance', v)}
          placeholder="ex: 0.5"
          hint="Distância do ponto de captação"
        />
        <InputField
          label="Potência da bomba"
          unit="cv"
          value={inputs.pumpPower}
          onChange={(v) => updateInput('pumpPower', v)}
          placeholder="ex: 75"
          hint="Potência do conjunto motobomba"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Custo da energia"
          prefix="R$" mask="currency" unit="R$/kWh"
          value={inputs.electricityCost}
          onChange={(v) => updateInput('electricityCost', v)}
          placeholder="ex: 0.85"
          hint="Tarifa da energia elétrica por kWh"
        />
        <InputField
          label="Horas de operação"
          unit="h/dia"
          value={inputs.hoursPerDay}
          onChange={(v) => updateInput('hoursPerDay', v)}
          placeholder="ex: 18"
          hint="Horas de funcionamento da bomba por dia"
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area} />
    </CalculatorLayout>
  )
}
