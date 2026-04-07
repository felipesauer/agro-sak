import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  area: string
  samplingMethod: string
  managementZones: string
  costPerSample: string
  depthLayers: string
}

interface Result {
  totalSamples: number
  samplesPerZone: number
  subSamplesPerComposite: number
  gridSpacing: number
  totalCost: number
  costPerHa: number
  walkingDistance: number
}

// ── Constants ──

const METHOD_OPTIONS = [
  { value: 'conventional', label: 'Convencional (1 amostra / 10-20 ha)' },
  { value: 'grid', label: 'Grade (1 amostra / 2-5 ha)' },
  { value: 'precision', label: 'Precisão (1 amostra / 1-2 ha)' },
]

const DEPTH_OPTIONS = [
  { value: '1', label: '1 camada (0-20 cm)' },
  { value: '2', label: '2 camadas (0-20 e 20-40 cm)' },
  { value: '3', label: '3 camadas (0-10, 10-20, 20-40 cm)' },
]

const SAMPLING_RATES: Record<string, { minHa: number; maxHa: number; subSamples: number }> = {
  conventional: { minHa: 10, maxHa: 20, subSamples: 15 },
  grid: { minHa: 2, maxHa: 5, subSamples: 10 },
  precision: { minHa: 1, maxHa: 2, subSamples: 8 },
}

const INITIAL: Inputs = {
  area: '',
  samplingMethod: 'conventional',
  managementZones: '1',
  costPerSample: '55',
  depthLayers: '1',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const area = parseFloat(inputs.area)
  const zones = parseInt(inputs.managementZones) || 1
  const costPerSample = parseFloat(inputs.costPerSample)
  const layers = parseInt(inputs.depthLayers) || 1

  const rate = SAMPLING_RATES[inputs.samplingMethod]
  if (!rate) return null

  const avgHaPerSample = (rate.minHa + rate.maxHa) / 2
  const areaPerZone = area / zones
  const samplesPerZone = Math.max(1, Math.ceil(areaPerZone / avgHaPerSample))
  const totalSamples = samplesPerZone * zones * layers

  const gridSpacing = Math.sqrt(avgHaPerSample * 10000) // meters between samples

  const totalCost = totalSamples * costPerSample
  const costPerHa = totalCost / area

  // Approximate walking distance (zigzag pattern)
  const walkingDistance = samplesPerZone * zones * gridSpacing * 1.4 / 1000 // km

  return {
    totalSamples,
    samplesPerZone,
    subSamplesPerComposite: rate.subSamples,
    gridSpacing,
    totalCost,
    costPerHa,
    walkingDistance,
  }
}

function validate(inputs: Inputs): string | null {
  const area = parseFloat(inputs.area)
  if (!inputs.area || isNaN(area) || area <= 0) return 'Informe a área total'
  if (area > 100000) return 'Área muito grande — verifique o valor'
  const zones = parseInt(inputs.managementZones)
  if (isNaN(zones) || zones < 1 || zones > 50) return 'Zonas de manejo deve ser entre 1 e 50'
  const cost = parseFloat(inputs.costPerSample)
  if (isNaN(cost) || cost < 0) return 'Custo por amostra deve ser positivo'
  return null
}

// ── Component ──

export default function SoilSampling() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Amostragem de Solo"
      description="Calcule o número de amostras de solo, espaçamento da grade e custo total para análise conforme a metodologia (convencional, grade ou precisão)."
      about="Calcule quantas amostras compostas de solo você precisa coletar conforme a metodologia escolhida (convencional, em grade ou agricultura de precisão). Inclui espaçamento da grade, subamostras por composta e estimativa de custo."
      methodology="Convencional: 1 amostra composta (15 subamostras) a cada 10-20 ha. Grade: 1 a cada 2-5 ha (10 subamostras). Precisão: 1 a cada 1-2 ha (8 subamostras). Fonte: Embrapa Solos, Manual de Análise Química de Solos, Plantas e Fertilizantes."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Total de amostras"
                value={formatNumber(result.totalSamples, 0)}
                unit="amostras compostas"
                highlight
                variant="success"
              />
              <ResultCard
                label="Custo total estimado"
                value={formatCurrency(result.totalCost)}
                highlight
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Amostras por zona"
                value={formatNumber(result.samplesPerZone, 0)}
                variant="default"
              />
              <ResultCard
                label="Subamostras por composta"
                value={formatNumber(result.subSamplesPerComposite, 0)}
                unit="tradagens"
                variant="default"
              />
              <ResultCard
                label="Espaçamento da grade"
                value={formatNumber(result.gridSpacing, 0)}
                unit="metros"
                variant="default"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Custo por hectare"
                value={formatCurrency(result.costPerHa)}
                unit="R$/ha"
                variant="default"
              />
              <ResultCard
                label="Distância de caminhamento"
                value={formatNumber(result.walkingDistance, 1)}
                unit="km (aprox.)"
                variant="default"
              />
            </div>

            {result.totalSamples > 100 && (
              <AlertBanner
                variant="info"
                message="Volume alto de amostras. Considere contratar serviço especializado de amostragem georreferenciada."
              />
            )}

            <AlertBanner
              variant="info"
              message="Colete em zigzag dentro de cada zona. Evite áreas de formigueiro, cupinzeiro, curvas de nível e linhas de adubação recentes."
            />
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Área total"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v as never)}
          placeholder="ex: 500"
          min="0"
          max="100000"
          required
          hint="Área total da propriedade ou talhão"
        />
        <SelectField
          label="Metodologia"
          options={METHOD_OPTIONS}
          value={inputs.samplingMethod}
          onChange={(v) => updateInput('samplingMethod', v as never)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Zonas de manejo"
          value={inputs.managementZones}
          onChange={(v) => updateInput('managementZones', v as never)}
          placeholder="ex: 3"
          min="1"
          max="50"
          hint="Talhões ou zonas homogêneas"
        />
        <SelectField
          label="Camadas de profundidade"
          options={DEPTH_OPTIONS}
          value={inputs.depthLayers}
          onChange={(v) => updateInput('depthLayers', v as never)}
        />
        <InputField
          label="Custo por amostra"
          unit="R$"
          value={inputs.costPerSample}
          onChange={(v) => updateInput('costPerSample', v as never)}
          placeholder="ex: 55"
          min="0"
          hint="Custo do laboratório"
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area} />
    </CalculatorLayout>
  )
}
