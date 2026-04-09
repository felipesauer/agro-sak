import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { DRYING_ENERGY_REF, MOISTURE_STANDARD, cropOptionsFrom } from '../../data/reference-data'
import { calculateDryingCost, validateDryingCost, type DryingCostResult } from '../../core/grain/drying-cost'

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

function calculate(inputs: Inputs): DryingCostResult | null {
  const grainWeight = parseFloat(inputs.grainWeight)
  const sourceKey = inputs.energySource as keyof typeof DRYING_ENERGY_REF.sources
  const source = DRYING_ENERGY_REF.sources[sourceKey]
  if (!source) return null

  const customPrice = parseFloat(inputs.energyPrice)
  const capacityKey = inputs.dryerCapacity as keyof typeof DRYING_ENERGY_REF.dryerCapacity
  const dryer = DRYING_ENERGY_REF.dryerCapacity[capacityKey]

  return calculateDryingCost({
    grainWeightTons: grainWeight,
    initialMoisture: parseFloat(inputs.initialMoisture),
    targetMoisture: parseFloat(inputs.targetMoisture),
    energySource: source,
    energyPriceOverride: isNaN(customPrice) || customPrice <= 0 ? undefined : customPrice,
    dryerThroughput: dryer ? dryer.throughput : 0,
    thirdPartyCostPerBag: parseFloat(inputs.thirdPartyCost) || DRYING_ENERGY_REF.thirdPartyCostPerBag.avg,
    kcalPerKgWater: DRYING_ENERGY_REF.kcalPerKgWater,
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.grainWeight) return 'Informe a quantidade de grãos (toneladas)'
  if (!inputs.initialMoisture) return 'Informe a umidade inicial'
  if (!inputs.targetMoisture) return 'Informe a umidade final desejada'
  return validateDryingCost({
    grainWeightTons: parseFloat(inputs.grainWeight),
    initialMoisture: parseFloat(inputs.initialMoisture),
    targetMoisture: parseFloat(inputs.targetMoisture),
  })
}

// ── Component ──

export default function DryingCost() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, DryingCostResult>({
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
                value={formatNumber(result.waterToRemoveKg, 0)}
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
                value={formatNumber(result.energyRequiredKcal / 1_000_000, 2)}
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
          hint="Peso total do lote a ser secado"
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
          hint="Umidade medida na colheita"
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
          hint="Padrão comercial da cultura"
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
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.grainWeight || !inputs.initialMoisture || !inputs.targetMoisture} />
    </CalculatorLayout>
  )
}
