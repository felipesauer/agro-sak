import { useState, useMemo } from 'react'
import useCalculator from '../../hooks/useCalculator'
import { calculateSeedingRate, validateSeedingRate, type SeedingRateResult } from '../../core/agronomic/seeding-rate'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import DataFreshness from '../../components/ui/DataFreshness'
import { formatNumber } from '../../utils/formatters'
import { SEEDING_DEFAULTS, cropOptionsFrom } from '../../data/reference-data'
import { useAllSeedingDefaults } from '../../db/hooks'

// ── Types ──

interface Inputs {
  crop: string
  population: string
  rowSpacing: string
  germination: string
  vigor: string
  tsw: string
  bagWeight: string
  seedPrice: string
}

function getInitial(crop: string): Inputs {
  const d = SEEDING_DEFAULTS[crop] ?? SEEDING_DEFAULTS.soybean
  return {
    crop,
    population: String(d.populationDefault),
    rowSpacing: String(d.rowSpacingDefault),
    germination: '85',
    vigor: '90',
    tsw: String(d.tswDefault),
    bagWeight: '40',
    seedPrice: '',
  }
}

// ── Calculation ──

function calculate(inputs: Inputs): SeedingRateResult | null {
  return calculateSeedingRate({
    population: parseFloat(inputs.population),
    rowSpacingCm: parseFloat(inputs.rowSpacing),
    germinationPercent: parseFloat(inputs.germination),
    vigorPercent: parseFloat(inputs.vigor),
    tswGrams: parseFloat(inputs.tsw),
    bagWeightKg: parseFloat(inputs.bagWeight) || 40,
    seedPricePerBag: parseFloat(inputs.seedPrice) || undefined,
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.population) return 'Informe a população desejada'
  if (!inputs.rowSpacing) return 'Informe o espaçamento entre linhas'
  if (!inputs.germination) return 'Informe a germinação da semente'
  if (!inputs.vigor) return 'Informe o vigor / fator de campo'
  if (!inputs.tsw) return 'Informe o peso de mil sementes (PMG)'
  return validateSeedingRate({
    population: parseFloat(inputs.population),
    rowSpacingCm: parseFloat(inputs.rowSpacing),
    germinationPercent: parseFloat(inputs.germination),
    vigorPercent: parseFloat(inputs.vigor),
    tswGrams: parseFloat(inputs.tsw),
    bagWeightKg: parseFloat(inputs.bagWeight) || 40,
    seedPricePerBag: parseFloat(inputs.seedPrice) || undefined,
  })
}

// ── Component ──

export default function SeedingRate() {
  const dbDefaults = useAllSeedingDefaults()
  const seedingData = useMemo(() => {
    if (!dbDefaults?.length) return SEEDING_DEFAULTS
    return Object.fromEntries(dbDefaults.map(d => [d.crop, {
      populationMin: d.populationMin,
      populationMax: d.populationMax,
      populationDefault: d.populationDefault,
      rowSpacingDefault: d.rowSpacingDefault,
      tswDefault: d.tswDefault,
    }])) as Record<string, typeof SEEDING_DEFAULTS[string]>
  }, [dbDefaults])
  const cropOptions = useMemo(() => [
    ...cropOptionsFrom(seedingData),
    { value: 'custom', label: '✦ Personalizado' },
  ], [seedingData])

  const [crop, setCrop] = useState('soybean')
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, SeedingRateResult>({
      initialInputs: getInitial(crop),
      calculate,
      validate,
    })

  const handleCropChange = (value: string) => {
    setCrop(value)
    updateInput('crop', value as never)
    if (value !== 'custom') {
      const d = seedingData[value] ?? SEEDING_DEFAULTS.soybean
      updateInput('population', String(d.populationDefault) as never)
      updateInput('rowSpacing', String(d.rowSpacingDefault) as never)
      updateInput('tsw', String(d.tswDefault) as never)
    }
  }

  const defaults = crop !== 'custom' ? (seedingData[crop] ?? SEEDING_DEFAULTS.soybean) : null

  return (
    <CalculatorLayout
      title="Taxa de Semeadura"
      description="Calcule a quantidade de sementes (kg/ha) com base na população desejada, espaçamento e qualidade da semente."
      about="A taxa de semeadura ajustada garante que a população final desejada seja atingida no campo, compensando a germinação e o vigor da semente. É essencial para regular a plantadeira corretamente e evitar desperdício ou falhas de estande."
      methodology="Sementes/ha ajustadas = População desejada / (Germinação × Vigor). kg/ha = (Sementes ajustadas × PMG) / 1.000.000. Sementes/metro linear = População × espaçamento entre linhas / 10.000. PMG = Peso de Mil Grãos (g). Sacas = kg/ha / 40."
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
                label={`Sacas de ${inputs.bagWeight || '40'} kg por hectare`}
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
            <AlertBanner
              variant="info"
              message="Reavalie a germinação e o vigor das sementes periodicamente — lotes armazenados podem perder qualidade ao longo da safra."
            />
          </div>
        )
      }
    >
      <SelectField
        label="Cultura"
        options={cropOptions}
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
          hint={defaults ? `Referência: ${formatNumber(defaults.populationMin, 0)} – ${formatNumber(defaults.populationMax, 0)}` : ''}
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
          hint="Soja: 45–50 cm, milho: 70–90 cm"
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
          hint={defaults ? `Referência ${cropOptions.find(c => c.value === crop)?.label}: ${defaults.tswDefault}g` : ''}
          min="10"
          max="500"
          required
        />
      </div>

      <InputField
        label="Peso da saca de semente"
        unit="kg"
        value={inputs.bagWeight}
        onChange={(v) => updateInput('bagWeight', v as never)}
        placeholder="ex: 40"
        min="10"
        max="60"
        hint="Peso da saca comercial (40, 50 ou 60 kg)"
      />

      <InputField
        label="Preço da saca de semente (opcional)"
        unit={`R$/sc ${inputs.bagWeight || '40'}kg`}
        value={inputs.seedPrice}
        onChange={(v) => updateInput('seedPrice', v as never)}
        placeholder="ex: 350"
        min="0"
        hint="Para estimar o custo com sementes"
      />

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.population || !inputs.germination || !inputs.tsw} />
      <DataFreshness table="seedingDefaults" label="Padrões de semeadura" />
    </CalculatorLayout>
  )
}
