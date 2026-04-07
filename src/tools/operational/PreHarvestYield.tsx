import { useState } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'

// ── Types ──

interface SoybeanInputs {
  crop: 'soybean'
  plantsPerMeter: string
  podsPerPlant: string
  grainsPerPod: string
  thousandGrainWeight: string
  rowSpacing: string
}

interface CornInputs {
  crop: 'corn'
  earsPerMeter: string
  rowsPerEar: string
  grainsPerRow: string
  thousandGrainWeight: string
  rowSpacing: string
}

type Inputs = SoybeanInputs | CornInputs

interface Result {
  yieldKgHa: number
  yieldScHa: number
  yieldLow: number
  yieldHigh: number
}

const CROP_OPTIONS = [
  { value: 'soybean', label: 'Soja' },
  { value: 'corn', label: 'Milho' },
]

const SOYBEAN_INITIAL: SoybeanInputs = {
  crop: 'soybean',
  plantsPerMeter: '14',
  podsPerPlant: '32',
  grainsPerPod: '2.4',
  thousandGrainWeight: '145',
  rowSpacing: '0.50',
}

const CORN_INITIAL: CornInputs = {
  crop: 'corn',
  earsPerMeter: '3.5',
  rowsPerEar: '16',
  grainsPerRow: '34',
  thousandGrainWeight: '290',
  rowSpacing: '0.50',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const pmg = parseFloat(inputs.thousandGrainWeight)
  const spacing = parseFloat(inputs.rowSpacing)

  let yieldKgHa: number

  if (inputs.crop === 'soybean') {
    const plants = parseFloat(inputs.plantsPerMeter)
    const pods = parseFloat(inputs.podsPerPlant)
    const grains = parseFloat(inputs.grainsPerPod)
    // plants/m ÷ spacing = plants/m², × 10000 = plants/ha, × grains × PMG/1e6 = kg/ha
    yieldKgHa = (plants * pods * grains * pmg) / (spacing * 100)
  } else {
    const ears = parseFloat(inputs.earsPerMeter)
    const rows = parseFloat(inputs.rowsPerEar)
    const grains = parseFloat(inputs.grainsPerRow)
    yieldKgHa = (ears * rows * grains * pmg) / (spacing * 100)
  }

  const yieldScHa = yieldKgHa / 60
  const yieldLow = yieldScHa * 0.9
  const yieldHigh = yieldScHa * 1.1

  return { yieldKgHa, yieldScHa, yieldLow, yieldHigh }
}

function validate(inputs: Inputs): string | null {
  const spacing = parseFloat(inputs.rowSpacing)
  if (!inputs.rowSpacing || spacing <= 0) return 'Informe o espaçamento entre linhas'
  if (!inputs.thousandGrainWeight) return 'Informe o peso de mil grãos (PMG)'

  if (inputs.crop === 'soybean') {
    if (!inputs.plantsPerMeter) return 'Informe as plantas por metro'
    if (!inputs.podsPerPlant) return 'Informe as vagens por planta'
    if (!inputs.grainsPerPod) return 'Informe os grãos por vagem'
  } else {
    if (!inputs.earsPerMeter) return 'Informe as espigas por metro'
    if (!inputs.rowsPerEar) return 'Informe as fileiras por espiga'
    if (!inputs.grainsPerRow) return 'Informe os grãos por fileira'
  }

  return null
}

// ── Component ──

export default function PreHarvestYield() {
  const [crop, setCrop] = useState<'soybean' | 'corn'>('soybean')

  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({
      initialInputs: crop === 'soybean' ? SOYBEAN_INITIAL : CORN_INITIAL,
      calculate,
      validate,
    })

  const handleCropChange = (value: string) => {
    const c = value as 'soybean' | 'corn'
    setCrop(c)
    clear()
  }

  return (
    <CalculatorLayout
      title="Estimativa de Produtividade Pré-Colheita"
      description="Estime a produtividade da lavoura antes da colheita, com base em amostragens de campo."
      about="Estime a produtividade da lavoura antes da colheita através de amostragem no campo. Colete dados de vagens/espigas, grãos por vagem e peso para projetar sc/ha."
      methodology="Soja: Produtividade = (plantas/m² × vagens/planta × grãos/vagem × PMS) / (peso saca × 1000). Milho: (espigas/m² × grãos/espiga × PMS) / (peso saca × 1000)."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Produtividade estimada"
                value={formatNumber(result.yieldScHa, 1)}
                unit="sc/ha"
                highlight
                variant="success"
              />
              <ResultCard
                label="Produtividade estimada"
                value={formatNumber(result.yieldKgHa, 0)}
                unit="kg/ha"
                variant="success"
              />
            </div>
            <ResultCard
              label="Intervalo de confiança (±10%)"
              value={`${formatNumber(result.yieldLow, 1)} – ${formatNumber(result.yieldHigh, 1)}`}
              unit="sc/ha"
              variant="default"
            />
            <AlertBanner
              variant="info"
              message="Esta é uma estimativa. Variações climáticas até a colheita podem alterar o resultado. Recomenda-se no mínimo 5 pontos de amostragem por talhão."
            />
          </div>
        )
      }
    >
      <SelectField
        label="Cultura"
        options={CROP_OPTIONS}
        value={crop}
        onChange={handleCropChange}
      />

      {crop === 'soybean' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Plantas por metro"
            value={inputs.crop === 'soybean' ? inputs.plantsPerMeter : ''}
            onChange={(v) => updateInput('plantsPerMeter' as never, v as never)}
            placeholder="ex: 14"
            step="0.1"
            required
            hint="Conte em 1 metro linear de linha (média de 5 pontos)"
          />
          <InputField
            label="Vagens por planta"
            value={inputs.crop === 'soybean' ? inputs.podsPerPlant : ''}
            onChange={(v) => updateInput('podsPerPlant' as never, v as never)}
            placeholder="ex: 32"
            step="0.1"
            required
            hint="Média de vagens em 5 plantas representativas"
          />
          <InputField
            label="Grãos por vagem"
            value={inputs.crop === 'soybean' ? inputs.grainsPerPod : ''}
            onChange={(v) => updateInput('grainsPerPod' as never, v as never)}
            placeholder="ex: 2.4"
            step="0.1"
            required
            hint="Média de grãos por vagem (normalmente 2 a 3)"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Espigas por metro"
            value={inputs.crop === 'corn' ? inputs.earsPerMeter : ''}
            onChange={(v) => updateInput('earsPerMeter' as never, v as never)}
            placeholder="ex: 3.5"
            step="0.1"
            required
            hint="Conte em 1 metro linear de linha (média de 5 pontos)"
          />
          <InputField
            label="Fileiras por espiga"
            value={inputs.crop === 'corn' ? inputs.rowsPerEar : ''}
            onChange={(v) => updateInput('rowsPerEar' as never, v as never)}
            placeholder="ex: 16"
            step="1"
            required
            hint="Conte as fileiras de grãos na espiga"
          />
          <InputField
            label="Grãos por fileira"
            value={inputs.crop === 'corn' ? inputs.grainsPerRow : ''}
            onChange={(v) => updateInput('grainsPerRow' as never, v as never)}
            placeholder="ex: 34"
            step="1"
            required
            hint="Conte os grãos em uma fileira completa"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Peso de mil grãos (PMG)"
          unit="g"
          value={inputs.thousandGrainWeight}
          onChange={(v) => updateInput('thousandGrainWeight' as never, v as never)}
          placeholder={crop === 'soybean' ? 'ex: 145' : 'ex: 290'}
          step="1"
          required
          hint="Consulte a ficha da cultivar ou pese 100 grãos e multiplique por 10"
        />
        <InputField
          label="Espaçamento entre linhas"
          unit="m"
          value={inputs.rowSpacing}
          onChange={(v) => updateInput('rowSpacing' as never, v as never)}
          placeholder="ex: 0.50"
          step="0.01"
          required
          hint="Distância entre linhas de plantio, em metros"
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.rowSpacing || !inputs.thousandGrainWeight || !inputs.plantsPerMeter} />
    </CalculatorLayout>
  )
}
