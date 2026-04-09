import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { calculateWaterConsumption, validateWaterConsumption, type WaterConsumptionResult } from '../../core/operational/water-consumption'

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

function calculate(inputs: Inputs): WaterConsumptionResult | null {
  return calculateWaterConsumption({
    areaHa: parseFloat(inputs.area),
    et0MmDay: parseFloat(inputs.et0),
    kc: parseFloat(inputs.kc),
    efficiencyPercent: parseFloat(inputs.efficiency),
    pumpPowerCv: parseFloat(inputs.pumpPower),
    electricityCostPerKwh: parseFloat(inputs.electricityCost),
    hoursPerDay: parseFloat(inputs.hoursPerDay),
  })
}

function validate(inputs: Inputs): string | null {
  return validateWaterConsumption({
    areaHa: parseFloat(inputs.area),
    et0MmDay: parseFloat(inputs.et0),
    kc: parseFloat(inputs.kc),
    efficiencyPercent: parseFloat(inputs.efficiency),
    pumpPowerCv: parseFloat(inputs.pumpPower),
    electricityCostPerKwh: parseFloat(inputs.electricityCost),
    hoursPerDay: parseFloat(inputs.hoursPerDay),
  })
}

// ── Component ──

export default function WaterConsumption() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, WaterConsumptionResult>({ initialInputs: INITIAL, calculate, validate })

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
              value={formatNumber(result.dailyLaminaMm, 1)}
              unit="mm/dia"
              highlight
              variant="warning"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Volume diário"
                value={formatNumber(result.dailyWaterM3, 0)}
                unit="m³/dia"
              />
              <ResultCard
                label="Volume mensal"
                value={formatNumber(result.monthlyWaterM3, 0)}
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
                value={formatCurrency(result.costPerHaMonth)}
                unit="/ha/mês"
              />
            </div>

            <AlertBanner
              variant="info"
              message={`Para irrigar ${inputs.area} ha com ${formatNumber(result.dailyLaminaMm, 1)} mm/dia, são necessários ${formatNumber(result.dailyWaterM3, 0)} m³ de água diariamente.`}
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
