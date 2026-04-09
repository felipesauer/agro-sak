import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { calculateElectricityCost, validateElectricityCost, type ElectricityCostResult } from '../../core/operational/electricity-cost'

// ── Types ──

interface Inputs {
  equipmentType: string
  power: string
  powerUnit: string
  hoursPerDay: string
  daysPerMonth: string
  months: string
  energyRate: string
  demandCharge: string
  area: string
}

// ── Constants ──

const INITIAL: Inputs = {
  equipmentType: 'irrigation_pivot',
  power: '',
  powerUnit: 'cv',
  hoursPerDay: '12',
  daysPerMonth: '25',
  months: '6',
  energyRate: '0.65',
  demandCharge: '30',
  area: '',
}

const EQUIPMENT_OPTIONS = [
  { value: 'irrigation_pivot', label: 'Pivô central' },
  { value: 'irrigation_drip', label: 'Irrigação localizada (gotejo)' },
  { value: 'irrigation_sprinkler', label: 'Irrigação por aspersão' },
  { value: 'grain_dryer', label: 'Secador de grãos' },
  { value: 'grain_cleaner', label: 'Máquina de limpeza de grãos' },
  { value: 'feed_mixer', label: 'Misturador de ração' },
  { value: 'milking', label: 'Ordenhadeira' },
  { value: 'cold_storage', label: 'Câmara fria / resfriamento' },
  { value: 'custom', label: '✦ Personalizado' },
]

const POWER_UNIT_OPTIONS = [
  { value: 'cv', label: 'CV (cavalo-vapor)' },
  { value: 'hp', label: 'HP (horsepower)' },
  { value: 'kw', label: 'kW (quilowatt)' },
]

// Typical power ranges (CV) — Source: EMBRAPA / fabricantes
const TYPICAL_POWER: Record<string, { power: number; hoursPerDay: number }> = {
  irrigation_pivot: { power: 75, hoursPerDay: 16 },
  irrigation_drip: { power: 15, hoursPerDay: 10 },
  irrigation_sprinkler: { power: 30, hoursPerDay: 12 },
  grain_dryer: { power: 50, hoursPerDay: 18 },
  grain_cleaner: { power: 10, hoursPerDay: 8 },
  feed_mixer: { power: 7.5, hoursPerDay: 4 },
  milking: { power: 5, hoursPerDay: 6 },
  cold_storage: { power: 20, hoursPerDay: 24 },
}

// ── Calculation ──

function calculate(inputs: Inputs): ElectricityCostResult | null {
  const power = parseFloat(inputs.power)
  const hoursPerDay = parseFloat(inputs.hoursPerDay)
  if (isNaN(power) || power <= 0 || isNaN(hoursPerDay) || hoursPerDay <= 0) return null

  return calculateElectricityCost({
    power,
    powerUnit: inputs.powerUnit as 'cv' | 'hp' | 'kw',
    hoursPerDay,
    daysPerMonth: parseFloat(inputs.daysPerMonth),
    months: parseFloat(inputs.months),
    energyRatePerKwh: parseFloat(inputs.energyRate),
    demandChargePerKw: parseFloat(inputs.demandCharge) || 0,
    areaHa: parseFloat(inputs.area) || undefined,
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.power) return 'Informe a potência do equipamento'
  return validateElectricityCost({
    power: parseFloat(inputs.power),
    powerUnit: inputs.powerUnit as 'cv' | 'hp' | 'kw',
    hoursPerDay: parseFloat(inputs.hoursPerDay),
    daysPerMonth: parseFloat(inputs.daysPerMonth),
    months: parseFloat(inputs.months),
    energyRatePerKwh: parseFloat(inputs.energyRate),
    demandChargePerKw: parseFloat(inputs.demandCharge) || 0,
  })
}

// ── Component ──

export default function ElectricityCost() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, ElectricityCostResult>({ initialInputs: INITIAL, calculate, validate })

  const handleEquipmentChange = (value: string) => {
    updateInput('equipmentType', value as never)
    const preset = TYPICAL_POWER[value]
    if (preset) {
      updateInput('power', String(preset.power) as never)
      updateInput('hoursPerDay', String(preset.hoursPerDay) as never)
      updateInput('powerUnit', 'cv' as never)
    }
  }

  return (
    <CalculatorLayout
      title="Custo de Energia Elétrica"
      description="Calcule o custo de energia elétrica de pivôs, secadores, ordenhadeiras e outros equipamentos da propriedade."
      result={result && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Custo mensal total"
              value={formatCurrency(result.monthlyCostTotal)}
              unit="/mês"
              highlight
            />
            <ResultCard
              label="Custo anual"
              value={formatCurrency(result.annualCost, 0)}
              unit={`/ ${inputs.months} meses`}
              highlight
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ResultCard
              label="Consumo mensal"
              value={formatNumber(result.monthlyKWh, 0)}
              unit="kWh/mês"
            />
            <ResultCard
              label="Custo por hora"
              value={formatCurrency(result.costPerHour)}
              unit="/h"
            />
            <ResultCard
              label="Potência real"
              value={formatNumber(result.powerKW, 1)}
              unit="kW"
            />
          </div>

          {result.costPerHa !== null && (
            <ResultCard
              label="Custo por hectare"
              value={formatCurrency(result.costPerHa)}
              unit="/ha/período"
              variant="warning"
            />
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-3">
              Composição do custo mensal
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Consumo de energia</span>
                <span className="font-medium">{formatCurrency(result.monthlyCostEnergy)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Demanda contratada</span>
                <span className="font-medium">{formatCurrency(result.monthlyCostDemand)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 font-semibold">
                <span>Total</span>
                <span className="text-agro-700">{formatCurrency(result.monthlyCostTotal)}</span>
              </div>
            </div>
          </div>

          {result.annualCost > 100000 && (
            <AlertBanner
              variant="warning"
              title="Custo energético elevado"
              message={`Com ${formatCurrency(result.annualCost, 0)} por período, considere avaliar a geração própria de energia (solar fotovoltaica) ou a contratação no mercado livre.`}
            />
          )}

          {result.monthlyKWh > 5000 && (
            <AlertBanner
              variant="info"
              title="Mercado livre de energia"
              message="Com consumo acima de 5.000 kWh/mês, sua propriedade pode ser elegível ao mercado livre de energia, com tarifas até 30% menores."
            />
          )}
        </div>
      )}
      about="Calcule o custo de energia elétrica de equipamentos agrícolas como pivôs de irrigação, secadores de grãos, ordenhadeiras e câmaras frias. Considere tanto o consumo de energia (kWh) quanto a demanda contratada para estimar o custo real da conta de luz."
      methodology="Consumo (kWh) = Potência (kW) × Horas/dia × Dias/mês. Custo = (Consumo × Tarifa) + (Potência × Demanda contratada). Conversão: 1 CV = 0,7355 kW, 1 HP = 0,7457 kW. Tarifa média rural Brasil: R$ 0,50-0,80/kWh (ANEEL). Demanda contratada varia por concessionária."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Tipo de equipamento"
          options={EQUIPMENT_OPTIONS}
          value={inputs.equipmentType}
          onChange={handleEquipmentChange}
          hint="Selecione para preencher valores típicos"
          required
        />
        <div className="grid gap-2 grid-cols-2">
          <InputField
            label="Potência"
            value={inputs.power}
            onChange={(v) => updateInput('power', v as never)}
            placeholder="ex: 75"
            required
            hint="Potência do motor em CV, HP ou kW"
          />
          <SelectField
            label="Unidade"
            options={POWER_UNIT_OPTIONS}
            value={inputs.powerUnit}
            onChange={(v) => updateInput('powerUnit', v as never)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Horas por dia"
          unit="h/dia"
          value={inputs.hoursPerDay}
          onChange={(v) => updateInput('hoursPerDay', v as never)}
          placeholder="ex: 12"
          min="1"
          max="24"
          required
          hint="Horas de funcionamento por dia"
        />
        <InputField
          label="Dias por mês"
          unit="dias"
          value={inputs.daysPerMonth}
          onChange={(v) => updateInput('daysPerMonth', v as never)}
          placeholder="ex: 25"
          min="1"
          max="31"
          required
          hint="Dias de operação no mês"
        />
        <InputField
          label="Meses de uso"
          unit="meses/ano"
          value={inputs.months}
          onChange={(v) => updateInput('months', v as never)}
          placeholder="ex: 6"
          min="1"
          max="12"
          required
          hint="Meses de uso por ano do equipamento"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Tarifa de energia"
          unit="R$/kWh"
          value={inputs.energyRate}
          onChange={(v) => updateInput('energyRate', v as never)}
          placeholder="ex: 0.65"
          hint="Tarifa rural (confira na conta)"
          required
        />
        <InputField
          label="Demanda contratada"
          unit="R$/kW"
          value={inputs.demandCharge}
          onChange={(v) => updateInput('demandCharge', v as never)}
          placeholder="ex: 30"
          hint="Se aplicável"
        />
        <InputField
          label="Área atendida"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v as never)}
          placeholder="ex: 100"
          hint="Opcional — para custo/ha"
        />
      </div>

      {error && <div className="mt-3"><AlertBanner variant="error" message={error} /></div>}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.power} />
    </CalculatorLayout>
  )
}
