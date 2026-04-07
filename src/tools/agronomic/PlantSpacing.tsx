import { useState } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'

// ── Types ──

type Mode = 'population' | 'spacing'

interface InputsPopulation {
  rowSpacing: string
  plantSpacing: string
}

interface InputsSpacing {
  rowSpacing: string
  population: string
}

interface Result {
  plantsPerHa: number
  plantsPerMeter: number
  areaPerPlant: number
  plantSpacingCm: number
}

// ── Component ──

export default function PlantSpacing() {
  const [mode, setMode] = useState<Mode>('population')

  // Mode 1 — calculate population from spacings
  const calcPop = useCalculator<InputsPopulation, Result>({
    initialInputs: { rowSpacing: '45', plantSpacing: '20' },
    calculate(inputs) {
      const rowM = parseFloat(inputs.rowSpacing) / 100
      const plantM = parseFloat(inputs.plantSpacing) / 100
      const plantsPerHa = 10_000 / (rowM * plantM)
      const plantsPerMeter = 1 / plantM
      const areaPerPlant = rowM * plantM
      return { plantsPerHa, plantsPerMeter, areaPerPlant, plantSpacingCm: parseFloat(inputs.plantSpacing) }
    },
    validate(inputs) {
      if (!inputs.rowSpacing) return 'Informe o espaçamento entre linhas'
      if (!inputs.plantSpacing) return 'Informe o espaçamento entre plantas'
      if (isNaN(parseFloat(inputs.rowSpacing)) || parseFloat(inputs.rowSpacing) <= 0) return 'Espaçamento entre linhas deve ser positivo'
      if (isNaN(parseFloat(inputs.plantSpacing)) || parseFloat(inputs.plantSpacing) <= 0) return 'Espaçamento entre plantas deve ser positivo'
      return null
    },
  })

  // Mode 2 — calculate spacing from population
  const calcSpacing = useCalculator<InputsSpacing, Result>({
    initialInputs: { rowSpacing: '45', population: '320000' },
    calculate(inputs) {
      const rowM = parseFloat(inputs.rowSpacing) / 100
      const pop = parseFloat(inputs.population)
      const plantsPerMeter = pop * rowM / 10_000
      const plantM = 1 / plantsPerMeter
      const plantSpacingCm = plantM * 100
      const areaPerPlant = rowM * plantM
      return { plantsPerHa: pop, plantsPerMeter, areaPerPlant, plantSpacingCm }
    },
    validate(inputs) {
      if (!inputs.rowSpacing) return 'Informe o espaçamento entre linhas'
      if (!inputs.population) return 'Informe a população desejada'
      if (isNaN(parseFloat(inputs.population)) || parseFloat(inputs.population) <= 0) return 'População deve ser positiva'
      return null
    },
  })

  const current = mode === 'population' ? calcPop : calcSpacing

  return (
    <CalculatorLayout
      title="Espaçamento de Plantio"
      description="Calcule a população de plantas ou o espaçamento necessário para atingir uma população-alvo."
      about="O espaçamento de plantio determina a população final de plantas e influencia diretamente o potencial produtivo, a competição por luz e a arquitetura do dossel. Populações adequadas variam por cultura, cultivar e região."
      methodology="População (pl/ha) = 10.000 m² / (espaçamento entre linhas em m × espaçamento entre plantas em m). No modo inverso: espaçamento entre plantas = 10.000 / (população × espaçamento entre linhas em m)."
      result={
        current.result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Plantas por hectare"
                value={formatNumber(current.result.plantsPerHa, 0)}
                unit="pl/ha"
                highlight
                variant="default"
              />
              <ResultCard
                label="Plantas por metro"
                value={formatNumber(current.result.plantsPerMeter, 1)}
                unit="pl/m"
                variant="default"
              />
              <ResultCard
                label="Área por planta"
                value={formatNumber(current.result.areaPerPlant * 10_000, 0)}
                unit="cm²"
                variant="default"
              />
            </div>
            {mode === 'spacing' && (
              <ResultCard
                label="Espaçamento entre plantas"
                value={formatNumber(current.result.plantSpacingCm, 1)}
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
            value={calcPop.inputs.rowSpacing}
            onChange={(v) => calcPop.updateInput('rowSpacing', v)}
            placeholder="ex: 45"
            min="10"
            max="200"
            required
            hint="Distância entre as linhas de plantio (soja: 45-50 cm, milho: 70-90 cm)"
          />
          <InputField
            label="Espaçamento entre plantas"
            unit="cm"
            value={calcPop.inputs.plantSpacing}
            onChange={(v) => calcPop.updateInput('plantSpacing', v)}
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
            value={calcSpacing.inputs.rowSpacing}
            onChange={(v) => calcSpacing.updateInput('rowSpacing', v)}
            placeholder="ex: 45"
            min="10"
            max="200"
            required
            hint="Distância entre as linhas de plantio"
          />
          <InputField
            label="População desejada"
            unit="pl/ha"
            value={calcSpacing.inputs.population}
            onChange={(v) => calcSpacing.updateInput('population', v)}
            placeholder="ex: 320000"
            min="1000"
            required
            hint="Recomendação da cultivar — soja: 200-360 mil, milho: 55-80 mil"
          />
        </div>
      )}

      {current.error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={current.error} />
        </div>
      )}

      <ActionButtons onCalculate={current.run} onClear={current.clear} disabled={mode === 'population' ? (!calcPop.inputs.rowSpacing || !calcPop.inputs.plantSpacing) : (!calcSpacing.inputs.rowSpacing || !calcSpacing.inputs.population)} />
    </CalculatorLayout>
  )
}
