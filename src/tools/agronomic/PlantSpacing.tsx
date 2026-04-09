import { useState } from 'react'
import useCalculator from '../../hooks/useCalculator'
import { calculatePlantSpacing, validatePlantSpacing } from '../../core/agronomic/plant-spacing'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  rowSpacing: string
  plantSpacing: string
  population: string
}

interface Result {
  plantsPerHa: number
  plantsPerMeter: number
  areaPerPlant: number
  plantSpacingCm: number
}

const INITIAL: Inputs = { rowSpacing: '45', plantSpacing: '20', population: '320000' }

// ── Component ──

export default function PlantSpacing() {
  const [mode, setMode] = useState<'population' | 'spacing'>('population')

  const { inputs, result, error, updateInput, run, clear } = useCalculator<Inputs, Result>({
    initialInputs: INITIAL,
    calculate(inputs) {
      const coreResult = calculatePlantSpacing(
        mode === 'population'
          ? { mode: 'fromSpacing', rowSpacingCm: parseFloat(inputs.rowSpacing), plantSpacingCm: parseFloat(inputs.plantSpacing) }
          : { mode: 'fromPopulation', rowSpacingCm: parseFloat(inputs.rowSpacing), population: parseFloat(inputs.population) }
      )
      return {
        plantsPerHa: coreResult.plantsPerHa,
        plantsPerMeter: coreResult.plantsPerMeter,
        areaPerPlant: coreResult.areaPerPlantM2,
        plantSpacingCm: coreResult.plantSpacingCm,
      }
    },
    validate(inputs) {
      return validatePlantSpacing(
        mode === 'population'
          ? { mode: 'fromSpacing', rowSpacingCm: parseFloat(inputs.rowSpacing), plantSpacingCm: parseFloat(inputs.plantSpacing) }
          : { mode: 'fromPopulation', rowSpacingCm: parseFloat(inputs.rowSpacing), population: parseFloat(inputs.population) }
      )
    },
  })

  return (
    <CalculatorLayout
      title="Espaçamento de Plantio"
      description="Calcule a população de plantas ou o espaçamento necessário para atingir uma população-alvo."
      about="O espaçamento de plantio determina a população final de plantas e influencia diretamente o potencial produtivo, a competição por luz e a arquitetura do dossel. Populações adequadas variam por cultura, cultivar e região."
      methodology="População (pl/ha) = 10.000 m² / (espaçamento entre linhas em m × espaçamento entre plantas em m). No modo inverso: espaçamento entre plantas = 10.000 / (população × espaçamento entre linhas em m)."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Plantas por hectare"
                value={formatNumber(result.plantsPerHa, 0)}
                unit="pl/ha"
                highlight
                variant="default"
              />
              <ResultCard
                label="Plantas por metro"
                value={formatNumber(result.plantsPerMeter, 1)}
                unit="pl/m"
                variant="default"
              />
              <ResultCard
                label="Área por planta"
                value={formatNumber(result.areaPerPlant * 10_000, 0)}
                unit="cm²"
                variant="default"
              />
            </div>
            {mode === 'spacing' && (
              <ResultCard
                label="Espaçamento entre plantas"
                value={formatNumber(result.plantSpacingCm, 1)}
                unit="cm"
                highlight
                variant="default"
              />
            )}
            <AlertBanner
              variant="info"
              message="Populações recomendadas variam de 200 a 360 mil pl/ha para soja e 55 a 80 mil pl/ha para milho, dependendo da cultivar e região."
            />
          </div>
        )
      }
    >
      {/* Mode tabs */}
      <div className="flex border-b border-agro-200 mb-4">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === 'population'
              ? 'border-agro-600 text-agro-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setMode('population')}
        >
          Calcular população
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === 'spacing'
              ? 'border-agro-600 text-agro-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setMode('spacing')}
        >
          Calcular espaçamento
        </button>
      </div>

      {mode === 'population' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Espaçamento entre linhas"
            unit="cm"
            value={inputs.rowSpacing}
            onChange={(v) => updateInput('rowSpacing', v)}
            placeholder="ex: 45"
            min="10"
            max="200"
            required
            hint="Distância entre as linhas de plantio (soja: 45-50 cm, milho: 70-90 cm)"
          />
          <InputField
            label="Espaçamento entre plantas"
            unit="cm"
            value={inputs.plantSpacing}
            onChange={(v) => updateInput('plantSpacing', v)}
            placeholder="ex: 20"
            min="1"
            max="200"
            required
            hint="Distância entre plantas na linha de plantio"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Espaçamento entre linhas"
            unit="cm"
            value={inputs.rowSpacing}
            onChange={(v) => updateInput('rowSpacing', v)}
            placeholder="ex: 45"
            min="10"
            max="200"
            required
            hint="Distância entre as linhas de plantio"
          />
          <InputField
            label="População desejada"
            unit="pl/ha"
            value={inputs.population}
            onChange={(v) => updateInput('population', v)}
            placeholder="ex: 320000"
            min="1000"
            required
            hint="Recomendação da cultivar — soja: 200-360 mil, milho: 55-80 mil"
          />
        </div>
      )}

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={mode === 'population' ? (!inputs.rowSpacing || !inputs.plantSpacing) : (!inputs.rowSpacing || !inputs.population)} />
    </CalculatorLayout>
  )
}
