import { useMemo } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { MOISTURE_STANDARD, cropOptionsFrom } from '../../data/reference-data'
import { useMoistureStandards } from '../../db/hooks'

// ── Types ──

interface Inputs {
  crop: string
  initialWeight: string
  initialMoisture: string
  targetMoisture: string
  dryingCostPerBag: string
  pricePerBag: string
}

interface Result {
  finalWeightKg: number
  lossKg: number
  lossBags: number
  dryingCost: number
  financialLoss: number
}

const INITIAL: Inputs = {
  crop: 'soybean',
  initialWeight: '',
  initialMoisture: '',
  targetMoisture: '14',
  dryingCostPerBag: '',
  pricePerBag: '',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const initialWeight = parseFloat(inputs.initialWeight)
  const initialMoisture = parseFloat(inputs.initialMoisture)
  const targetMoisture = parseFloat(inputs.targetMoisture)
  const dryingCost = parseFloat(inputs.dryingCostPerBag) || 0
  const price = parseFloat(inputs.pricePerBag) || 0

  const finalWeightKg =
    initialWeight * ((100 - initialMoisture) / (100 - targetMoisture))
  const lossKg = initialWeight - finalWeightKg
  const lossBags = lossKg / 60

  const initialBags = initialWeight / 60
  const totalDryingCost = initialBags * dryingCost
  const financialLoss = lossBags * price

  return {
    finalWeightKg,
    lossKg,
    lossBags,
    dryingCost: totalDryingCost,
    financialLoss,
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.initialWeight) return 'Informe o peso inicial'
  if (!inputs.initialMoisture) return 'Informe a umidade inicial'
  if (!inputs.targetMoisture) return 'Informe a umidade final desejada'
  const ui = parseFloat(inputs.initialMoisture)
  const uf = parseFloat(inputs.targetMoisture)
  if (ui <= uf) return 'Umidade inicial deve ser maior que a final'
  if (isNaN(parseFloat(inputs.initialWeight)) || parseFloat(inputs.initialWeight) <= 0) return 'Peso deve ser positivo'
  return null
}

// ── Component ──

export default function DryingLoss() {
  const dbStandards = useMoistureStandards()
  const moistureStds = useMemo(() => {
    if (!dbStandards) return MOISTURE_STANDARD
    return Object.fromEntries(dbStandards.map(d => [d.crop, d.moisture])) as Record<string, number>
  }, [dbStandards])
  const cropOptions = useMemo(() => [
    ...cropOptionsFrom(moistureStds),
    { value: 'custom', label: '✦ Personalizado' },
  ], [moistureStds])
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  const handleCropChange = (v: string) => {
    updateInput('crop', v)
    if (v !== 'custom') {
      updateInput('targetMoisture', String(moistureStds[v] ?? 14))
    }
  }

  return (
    <CalculatorLayout
      title="Perda por Secagem de Grãos"
      description="Calcule a quebra de peso (perda de massa) durante a secagem dos grãos, da umidade de colheita até a umidade de comercialização."
      about="Calcule a quebra de peso durante a secagem de grãos. Ao reduzir a umidade, parte do peso se perde em água evaporada — saiba exatamente quanto."
      methodology="Peso seco = Peso úmido × (100 - Umidade inicial) / (100 - Umidade final). Perda = Peso úmido - Peso seco. Fórmula clássica de conservação de matéria seca."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Peso final após secagem"
                value={formatNumber(result.finalWeightKg, 0)}
                unit="kg"
                highlight
                variant="success"
              />
              <ResultCard
                label="Perda de peso"
                value={formatNumber(result.lossKg, 0)}
                unit="kg"
                variant="warning"
              >
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(result.lossBags, 1)} sacas perdidas
                </p>
              </ResultCard>
            </div>

            {(result.dryingCost > 0 || result.financialLoss > 0) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {result.dryingCost > 0 && (
                  <ResultCard
                    label="Custo total da secagem"
                    value={formatCurrency(result.dryingCost)}
                    variant="warning"
                  />
                )}
                {result.financialLoss > 0 && (
                  <ResultCard
                    label="Perda financeira (peso)"
                    value={formatCurrency(result.financialLoss)}
                    variant="danger"
                  >
                    <p className="text-xs text-red-500 mt-1">
                      Valor das sacas perdidas na secagem
                    </p>
                  </ResultCard>
                )}
              </div>
            )}            {result.lossPercent > 1.5 && (
              <AlertBanner
                variant="warning"
                message="Perda acima de 1,5% — considere negociar taxa de secagem ou buscar outra unidade armazenadora."
              />
            )}          </div>
        )
      }
    >
      <SelectField
        label="Cultura"
        value={inputs.crop}
        onChange={handleCropChange}
        options={cropOptions}
        required
      />

      <InputField
        label="Peso inicial"
        unit="kg"
        value={inputs.initialWeight}
        onChange={(v) => updateInput('initialWeight', v)}
        placeholder="ex: 50000"
        min="0"
        required
        hint="Peso bruto do lote antes da secagem"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Umidade inicial"
          unit="%"
          value={inputs.initialMoisture}
          onChange={(v) => updateInput('initialMoisture', v)}
          placeholder="ex: 17"
          step="0.1"
          min="0"
          max="40"
          required
          hint="Umidade medida na recepção"
        />
        <InputField
          label="Umidade final desejada"
          unit="%"
          value={inputs.targetMoisture}
          onChange={(v) => updateInput('targetMoisture', v)}
          placeholder="ex: 14"
          step="0.1"
          min="0"
          max="40"
          required
          hint="Padrão de comercialização da cultura"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Custo de secagem"
          prefix="R$" unit="R$/sc"
          value={inputs.dryingCostPerBag}
          onChange={(v) => updateInput('dryingCostPerBag', v)}
          placeholder="ex: 8.00"
          step="0.01"
          hint="Opcional"
        />
        <InputField
          label="Preço da saca"
          prefix="R$" unit="R$/sc"
          value={inputs.pricePerBag}
          onChange={(v) => updateInput('pricePerBag', v)}
          placeholder="ex: 115"
          step="0.01"
          hint="Opcional — para calcular perda financeira"
        />
      </div>

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.initialWeight || !inputs.initialMoisture || !inputs.targetMoisture} />
    </CalculatorLayout>
  )
}
