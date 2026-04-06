import { useState } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'
import { SEEDING_DEFAULTS, cropOptionsFrom } from '../../data/reference-data'

// ── Types ──

interface Inputs {
  crop: string
  population: string
  rowSpacing: string
  germination: string
  vigor: string
  tsw: string
  seedPrice: string
}

interface Result {
  seedsPerMeter: number
  adjustedSeedsPerHa: number
  kgPerHa: number
  bagsPerHa: number
  costPerHa: number | null
}

const CROP_OPTIONS = cropOptionsFrom(SEEDING_DEFAULTS)

function getInitial(crop: string): Inputs {
  const d = SEEDING_DEFAULTS[crop] ?? SEEDING_DEFAULTS.soybean
  return {
    crop,
    population: String(d.populationDefault),
    rowSpacing: String(d.rowSpacingDefault),
    germination: '85',
    vigor: '90',
    tsw: String(d.tswDefault),
    seedPrice: '',
  }
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const pop = parseFloat(inputs.population)
  const spacing = parseFloat(inputs.rowSpacing)
  const germ = parseFloat(inputs.germination)
  const vig = parseFloat(inputs.vigor)
  const tsw = parseFloat(inputs.tsw)
  const price = parseFloat(inputs.seedPrice) || 0

  // Seeds per linear meter
  const seedsPerMeter = (pop * (spacing / 100)) / 10_000

  // Adjusted seeds/ha (compensate for germination and vigor)
  const efficiency = (germ / 100) * (vig / 100)
  const adjustedSeedsPerHa = pop / efficiency

  // Kg per hectare
  const kgPerHa = (adjustedSeedsPerHa * tsw) / 1_000_000

  // 40kg bags
  const bagsPerHa = kgPerHa / 40

  // Cost
  const costPerHa = price > 0 ? bagsPerHa * price : null

  return { seedsPerMeter, adjustedSeedsPerHa, kgPerHa, bagsPerHa, costPerHa }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.population) return 'Informe a população desejada'
  if (!inputs.rowSpacing) return 'Informe o espaçamento entre linhas'
  if (!inputs.germination) return 'Informe a germinação da semente'
  if (!inputs.vigor) return 'Informe o vigor / fator de campo'
  if (!inputs.tsw) return 'Informe o peso de mil sementes (PMG)'
  const germ = parseFloat(inputs.germination)
  const vig = parseFloat(inputs.vigor)
  if (germ < 50 || germ > 100) return 'Germinação deve estar entre 50% e 100%'
  if (vig < 50 || vig > 100) return 'Vigor deve estar entre 50% e 100%'
  return null
}

// ── Component ──

export default function SeedingRate() {
  const [crop, setCrop] = useState('soybean')
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({
      initialInputs: getInitial(crop),
      calculate,
      validate,
    })

  const handleCropChange = (value: string) => {
    setCrop(value)
    const d = SEEDING_DEFAULTS[value] ?? SEEDING_DEFAULTS.soybean
    updateInput('crop', value as never)
    updateInput('population', String(d.populationDefault) as never)
    updateInput('rowSpacing', String(d.rowSpacingDefault) as never)
    updateInput('tsw', String(d.tswDefault) as never)
  }

  const defaults = SEEDING_DEFAULTS[crop] ?? SEEDING_DEFAULTS.soybean

  return (
    <CalculatorLayout
      title="Taxa de Semeadura"
      description="Calcule a quantidade de sementes (kg/ha) com base na população desejada, espaçamento e qualidade da semente."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="kg de semente por hectare"
                value={formatNumber(result.kgPerHa, 1)}
                unit="kg/ha"
                highlight
                variant="default"
              />
              <ResultCard
                label="Sementes por metro linear"
                value={formatNumber(result.seedsPerMeter, 1)}
                unit="sem/m"
                highlight
                variant="default"
              >
                <p className="text-xs text-gray-500 mt-1">
                  Configuração da plantadeira
                </p>
              </ResultCard>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Sacas de 40 kg por hectare"
                value={formatNumber(result.bagsPerHa, 2)}
                unit="sc/ha"
                variant="default"
              />
              <ResultCard
                label="Sementes/ha (ajustadas)"
                value={formatNumber(result.adjustedSeedsPerHa, 0)}
                unit="sem/ha"
                variant="default"
              />
            </div>
            {result.costPerHa !== null && (
              <ResultCard
                label="Custo estimado com sementes"
                value={formatNumber(result.costPerHa, 2)}
                unit="R$/ha"
                variant="warning"
              />
            )}
          </div>
        )
      }
    >
      <SelectField
        label="Cultura"
        options={CROP_OPTIONS}
        value={inputs.crop}
        onChange={handleCropChange}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="População desejada"
          unit="plantas/ha"
          value={inputs.population}
          onChange={(v) => updateInput('population', v as never)}
          placeholder="ex: 320000"
          hint={`Referência: ${formatNumber(defaults.populationMin, 0)} – ${formatNumber(defaults.populationMax, 0)}`}
          min="50000"
          max="600000"
          required
        />
        <InputField
          label="Espaçamento entre linhas"
          unit="cm"
          value={inputs.rowSpacing}
          onChange={(v) => updateInput('rowSpacing', v as never)}
          placeholder="ex: 45"
          min="25"
          max="90"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Germinação"
          unit="%"
          value={inputs.germination}
          onChange={(v) => updateInput('germination', v as never)}
          placeholder="ex: 85"
          hint="Veja no teste de germinação"
          min="50"
          max="100"
          required
        />
        <InputField
          label="Vigor / Fator de campo"
          unit="%"
          value={inputs.vigor}
          onChange={(v) => updateInput('vigor', v as never)}
          placeholder="ex: 90"
          hint="Perda de emergência no campo"
          min="50"
          max="100"
          required
        />
        <InputField
          label="PMG (Peso de mil sementes)"
          unit="g"
          value={inputs.tsw}
          onChange={(v) => updateInput('tsw', v as never)}
          placeholder="ex: 145"
          hint={`Referência ${CROP_OPTIONS.find(c => c.value === crop)?.label}: ${defaults.tswDefault}g`}
          min="10"
          max="500"
          required
        />
      </div>

      <InputField
        label="Preço da saca de semente (opcional)"
        unit="R$/sc 40kg"
        value={inputs.seedPrice}
        onChange={(v) => updateInput('seedPrice', v as never)}
        placeholder="ex: 350"
        min="0"
      />

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
