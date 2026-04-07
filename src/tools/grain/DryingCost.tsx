import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { DRYING_ENERGY_REF, MOISTURE_STANDARD, cropOptionsFrom } from '../../data/reference-data'

// ── Types ──

interface Inputs {
  crop: string
  grainWeight: string
  initialMoisture: string
  targetMoisture: string
  energySource: string
  energyPrice: string
  dryerCapacity: string
  thirdPartyCost: string
}

interface Result {
  waterToRemove: number
  energyRequired: number
  fuelConsumed: number
  fuelUnit: string
  energyCost: number
  energyCostPerTon: number
  energyCostPerBag: number
  dryingTimeHours: number
  thirdPartyCostTotal: number
  thirdPartyCostPerTon: number
  savings: number
  ownIsCheaper: boolean
}

// ── Constants ──

const CROP_OPTIONS = [
  ...cropOptionsFrom(MOISTURE_STANDARD),
  { value: 'custom', label: '✦ Personalizado' },
]

const ENERGY_SOURCE_OPTIONS = Object.entries(DRYING_ENERGY_REF.sources).map(([value, s]) => ({
  value,
  label: s.label,
}))

const DRYER_OPTIONS = Object.entries(DRYING_ENERGY_REF.dryerCapacity).map(([value, d]) => ({
  value,
  label: d.label,
}))

const INITIAL: Inputs = {
  crop: 'soybean',
  grainWeight: '',
  initialMoisture: '',
  targetMoisture: '14',
  energySource: 'firewood',
  energyPrice: '',
  dryerCapacity: 'medium',
  thirdPartyCost: String(DRYING_ENERGY_REF.thirdPartyCostPerBag.avg),
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const grainWeight = parseFloat(inputs.grainWeight) // in tons
  const ui = parseFloat(inputs.initialMoisture)
  const uf = parseFloat(inputs.targetMoisture)

  const sourceKey = inputs.energySource as keyof typeof DRYING_ENERGY_REF.sources
  const source = DRYING_ENERGY_REF.sources[sourceKey]
  if (!source) return null

  const customPrice = parseFloat(inputs.energyPrice)
  const price = isNaN(customPrice) || customPrice <= 0 ? source.pricePerUnit : customPrice

  const capacityKey = inputs.dryerCapacity as keyof typeof DRYING_ENERGY_REF.dryerCapacity
  const dryer = DRYING_ENERGY_REF.dryerCapacity[capacityKey]

  const thirdPartyCostPerBag = parseFloat(inputs.thirdPartyCost) || DRYING_ENERGY_REF.thirdPartyCostPerBag.avg

  // Weight of water to remove (kg)
  // Water removed = grainWeight(kg) × (Ui - Uf) / (100 - Uf)
  const grainWeightKg = grainWeight * 1000
  const waterToRemove = grainWeightKg * (ui - uf) / (100 - uf)

  // Energy required (kcal)
  const energyRequired = waterToRemove * DRYING_ENERGY_REF.kcalPerKgWater

  // Fuel consumed (in source units)
  const fuelConsumed = energyRequired / (source.kcalPerUnit * source.efficiency)

  // Cost
  const energyCost = fuelConsumed * price
  const energyCostPerTon = grainWeight > 0 ? energyCost / grainWeight : 0
  const energyCostPerBag = energyCostPerTon * 0.06 // 60 kg bag = 0.06 ton

  // Drying time
  const dryingTimeHours = dryer ? grainWeight / dryer.throughput : 0

  // Third-party comparison
  const totalBags = grainWeightKg / 60
  const thirdPartyCostTotal = totalBags * thirdPartyCostPerBag
  const thirdPartyCostPerTon = grainWeight > 0 ? thirdPartyCostTotal / grainWeight : 0

  const savings = thirdPartyCostTotal - energyCost
  const ownIsCheaper = savings > 0

  return {
    waterToRemove,
    energyRequired,
    fuelConsumed,
    fuelUnit: source.unit,
    energyCost,
    energyCostPerTon,
    energyCostPerBag,
    dryingTimeHours,
    thirdPartyCostTotal,
    thirdPartyCostPerTon,
    savings: Math.abs(savings),
    ownIsCheaper,
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.grainWeight) return 'Informe a quantidade de grãos (toneladas)'
  if (!inputs.initialMoisture) return 'Informe a umidade inicial'
  if (!inputs.targetMoisture) return 'Informe a umidade final desejada'
  const weight = parseFloat(inputs.grainWeight)
  if (isNaN(weight) || weight <= 0) return 'A quantidade de grãos deve ser maior que zero'
  const ui = parseFloat(inputs.initialMoisture)
  const uf = parseFloat(inputs.targetMoisture)
  if (isNaN(ui) || ui <= 0 || ui > 50) return 'Umidade inicial deve estar entre 1% e 50%'
  if (isNaN(uf) || uf <= 0 || uf > 50) return 'Umidade final deve estar entre 1% e 50%'
  if (ui <= uf) return 'Umidade inicial deve ser maior que a final'
  return null
}

// ── Component ──

export default function DryingCost() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({
      initialInputs: INITIAL,
      calculate,
      validate,
    })

  const handleCropChange = (value: string) => {
    updateInput('crop', value as never)
    if (value !== 'custom' && MOISTURE_STANDARD[value]) {
      updateInput('targetMoisture', String(MOISTURE_STANDARD[value]) as never)
    }
  }

  return (
    <CalculatorLayout
      title="Custo de Secagem"
      description="Calcule o custo energético da secagem de grãos e compare com o custo de um armazém terceirizado."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Custo de secagem própria"
                value={formatCurrency(result.energyCostPerTon)}
                unit="R$/t"
                highlight
              />
              <ResultCard
                label="Custo terceiro"
                value={formatCurrency(result.thirdPartyCostPerTon)}
                unit="R$/t"
                highlight
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Custo total (próprio)"
                value={formatCurrency(result.energyCost)}
                variant="default"
              />
              <ResultCard
                label="Custo por saca"
                value={formatCurrency(result.energyCostPerBag)}
                unit="R$/sc 60kg"
                variant="default"
              />
              <ResultCard
                label="Tempo de secagem"
                value={formatNumber(result.dryingTimeHours, 1)}
                unit="horas"
                variant="default"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Água removida"
                value={formatNumber(result.waterToRemove, 0)}
                unit="kg"
                variant="default"
              />
              <ResultCard
                label={`Consumo (${result.fuelUnit})`}
                value={formatNumber(result.fuelConsumed, 1)}
                unit={result.fuelUnit}
                variant="default"
              />
              <ResultCard
                label="Energia necessária"
                value={formatNumber(result.energyRequired / 1_000_000, 2)}
                unit="Mcal"
                variant="default"
              />
            </div>

            <ResultCard
              label={result.ownIsCheaper ? 'Economia com secagem própria' : 'Custo adicional da secagem própria'}
              value={formatCurrency(result.savings)}
              variant={result.ownIsCheaper ? 'success' : 'warning'}
            >
              <p className="text-xs text-gray-500 mt-1">
                {result.ownIsCheaper
                  ? 'Secar no próprio secador é mais barato que pagar o armazém'
                  : 'O armazém terceirizado sai mais barato neste cenário'}
              </p>
            </ResultCard>

            {result.dryingTimeHours > 48 && (
              <AlertBanner
                variant="warning"
                title="Tempo de secagem elevado"
                message={`Com ${formatNumber(result.dryingTimeHours, 1)} horas de secagem, considere um secador de maior capacidade ou escalonar a colheita para evitar gargalos logísticos.`}
              />
            )}
          </div>
        )
      }
      about="A secagem é uma etapa crítica na pós-colheita. Grãos colhidos com umidade acima do padrão comercial precisam ser secos para evitar perdas por fungos e fermentação. O custo de secagem varia conforme a fonte de energia (lenha, GLP, diesel ou elétrico) e a eficiência do secador."
      methodology="Água removida (kg) = peso × (Ui − Uf) / (100 − Uf). Energia = água × 700 kcal/kg. Combustível = energia / (poder calorífico × eficiência). Custo = combustível × preço unitário. Fontes: EMBRAPA Instrumentação, CONAB."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Cultura"
          options={CROP_OPTIONS}
          value={inputs.crop}
          onChange={handleCropChange}
        />
        <InputField
          label="Quantidade de grãos"
          unit="toneladas"
          value={inputs.grainWeight}
          onChange={(v) => updateInput('grainWeight', v as never)}
          placeholder="ex: 100"
          min="0"
          max="100000"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Umidade inicial"
          unit="%"
          value={inputs.initialMoisture}
          onChange={(v) => updateInput('initialMoisture', v as never)}
          placeholder="ex: 21"
          min="1"
          max="50"
          required
        />
        <InputField
          label="Umidade final"
          unit="%"
          value={inputs.targetMoisture}
          onChange={(v) => updateInput('targetMoisture', v as never)}
          placeholder="ex: 14"
          min="1"
          max="50"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Fonte de energia"
          options={ENERGY_SOURCE_OPTIONS}
          value={inputs.energySource}
          onChange={(v) => updateInput('energySource', v as never)}
          required
        />
        <InputField
          label="Preço da energia"
          unit={`R$/${DRYING_ENERGY_REF.sources[inputs.energySource as keyof typeof DRYING_ENERGY_REF.sources]?.unit ?? 'un'}`}
          value={inputs.energyPrice}
          onChange={(v) => updateInput('energyPrice', v as never)}
          placeholder={`Ref: ${DRYING_ENERGY_REF.sources[inputs.energySource as keyof typeof DRYING_ENERGY_REF.sources]?.pricePerUnit ?? ''}`}
          hint="Deixe vazio para usar preço referência"
          min="0"
          max="100"
        />
        <SelectField
          label="Capacidade do secador"
          options={DRYER_OPTIONS}
          value={inputs.dryerCapacity}
          onChange={(v) => updateInput('dryerCapacity', v as never)}
        />
      </div>

      <InputField
        label="Custo de secagem terceirizado"
        unit="R$/sc 60kg"
        value={inputs.thirdPartyCost}
        onChange={(v) => updateInput('thirdPartyCost', v as never)}
        placeholder={`Ref: ${DRYING_ENERGY_REF.thirdPartyCostPerBag.avg}`}
        hint={`Faixa: R$ ${DRYING_ENERGY_REF.thirdPartyCostPerBag.min} – R$ ${DRYING_ENERGY_REF.thirdPartyCostPerBag.max} por saca`}
        min="0"
        max="50"
      />

      {error && <div className="mt-3"><AlertBanner variant="error" message={error} /></div>}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
