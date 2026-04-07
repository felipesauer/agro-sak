import { useMemo } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import DataFreshness from '../../components/ui/DataFreshness'
import { formatNumber } from '../../utils/formatters'
import { NUTRIENT_REMOVAL, cropOptionsFrom } from '../../data/reference-data'
import { BAG_WEIGHT_KG } from '../../utils/conversions'
import { useAllNutrientRemoval } from '../../db/hooks'

// ── Types ──

interface Inputs {
  crop: string
  productivity: string
  part: string
  area: string
  priceN: string
  priceP: string
  priceK: string
  customN: string
  customP: string
  customK: string
  customS: string
  customBagKg: string
}

interface NutrientRow {
  nutrient: string
  kgPerHa: number
  totalKg: number | null
}

interface Result {
  rows: NutrientRow[]
  totalArea: number | null
}

const INITIAL: Inputs = {
  crop: 'soybean',
  productivity: '',
  part: 'grain',
  area: '',
  priceN: '',
  priceP: '',
  priceK: '',
  customN: '15',
  customP: '8',
  customK: '5',
  customS: '2',
  customBagKg: '60',
}

const PART_OPTIONS = [
  { value: 'grain', label: 'Apenas grão' },
  { value: 'grain_straw', label: 'Grão + palhada' },
]

// Straw/residue factors by crop (grain+straw : grain-only ratio)
const STRAW_FACTOR: Record<string, number> = {
  soybean: 1.30,
  corn: 1.50,
  wheat: 1.40,
  cotton: 1.20,
  coffee: 1.15,
  rice: 1.60,
  sugarcane: 1.00,
  bean: 1.30,
}

// ── Calculation ──

type NutrientData = Record<string, { n: number; p2o5: number; k2o: number; s: number }>

function calculate(inputs: Inputs, nutrientData: NutrientData): Result | null {
  const prod = parseFloat(inputs.productivity)
  const bagKg = inputs.crop === 'custom' ? (parseFloat(inputs.customBagKg) || 60) : (BAG_WEIGHT_KG[inputs.crop] ?? 60)
  const tonsPerHa = (prod * bagKg) / 1000

  const removal = inputs.crop === 'custom'
    ? { n: parseFloat(inputs.customN) || 0, p2o5: parseFloat(inputs.customP) || 0, k2o: parseFloat(inputs.customK) || 0, s: parseFloat(inputs.customS) || 0 }
    : nutrientData[inputs.crop]
  if (!removal) return null

  const strawFactor = inputs.part === 'grain_straw' ? (STRAW_FACTOR[inputs.crop] ?? 1.3) : 1
  const area = parseFloat(inputs.area) || 0

  const nutrients: { key: keyof typeof removal; label: string }[] = [
    { key: 'n', label: 'N (Nitrogênio)' },
    { key: 'p2o5', label: 'P₂O₅ (Fósforo)' },
    { key: 'k2o', label: 'K₂O (Potássio)' },
    { key: 's', label: 'S (Enxofre)' },
  ]

  const rows = nutrients.map(({ key, label }) => {
    const kgPerHa = tonsPerHa * removal[key] * strawFactor
    return {
      nutrient: label,
      kgPerHa,
      totalKg: area > 0 ? kgPerHa * area : null,
    }
  })

  return { rows, totalArea: area > 0 ? area : null }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.productivity) return 'Informe a produtividade'
  if (isNaN(parseFloat(inputs.productivity)) || parseFloat(inputs.productivity) <= 0) return 'Produtividade deve ser positiva'
  return null
}

// ── Component ──

export default function NutrientRemoval() {
  const dbData = useAllNutrientRemoval()
  const nutrientData = useMemo<NutrientData>(() => {
    if (!dbData) return NUTRIENT_REMOVAL
    return Object.fromEntries(dbData.map(d => [d.crop, { n: d.n, p2o5: d.p2o5, k2o: d.k2o, s: d.s }]))
  }, [dbData])
  const cropOptions = useMemo(() => [
    ...cropOptionsFrom(nutrientData),
    { value: 'custom', label: '✦ Personalizado' },
  ], [nutrientData])
  const calcFn = useMemo(() => (inputs: Inputs) => calculate(inputs, nutrientData), [nutrientData])
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate: calcFn, validate })

  return (
    <CalculatorLayout
      title="Exportação de Nutrientes"
      description="Calcule a quantidade de nutrientes removidos do solo pela colheita e planeje a adubação de reposição."
      about="Cada tonelada de grão colhida remove do solo quantidades específicas de N, P₂O₅, K₂O e S. Conhecer essa exportação é fundamental para planejar a adubação de reposição e manter a fertilidade do solo ao longo das safras."
      methodology="Exportação (kg/ha) = Produtividade (t/ha) × coeficiente de extração (kg/t de grão). Coeficientes baseados em EMBRAPA e literatura técnica. Opção grão + palhada aplica fator de +30% para estimar a extração total da planta."
      result={
        result && (
          <div className="space-y-4">
            <ComparisonTable
              columns={[
                { key: 'nutrient', label: 'Nutriente' },
                { key: 'kgPerHa', label: 'kg/ha', align: 'right', format: (v) => formatNumber(v as number, 1) },
                ...(result.totalArea
                  ? [
                      { key: 'totalKg' as const, label: 'Total (kg)', align: 'right' as const, format: (v: unknown) => formatNumber(v as number, 0) },
                      { key: 'totalT' as const, label: 'Total (t)', align: 'right' as const, format: (v: unknown) => formatNumber(v as number, 2) },
                    ]
                  : []),
              ]}
              rows={result.rows.map((row) => ({
                nutrient: row.nutrient,
                kgPerHa: row.kgPerHa,
                totalKg: row.totalKg ?? 0,
                totalT: row.totalKg ? row.totalKg / 1000 : 0,
              }))}
              rowKey="nutrient"
            />

            <AlertBanner
              variant="info"
              message="Esses valores representam a reposição mínima para manter a fertilidade do solo. Consulte o laudo de solo para recomendação completa."
            />
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Cultura"
          options={cropOptions}
          value={inputs.crop}
          onChange={(v) => updateInput('crop', v as never)}
        />
        <SelectField
          label="Parte exportada"
          options={PART_OPTIONS}
          value={inputs.part}
          onChange={(v) => updateInput('part', v as never)}
        />
      </div>

      {inputs.crop === 'custom' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <InputField label="Peso da saca" unit="kg" value={inputs.customBagKg} onChange={(v) => updateInput('customBagKg', v as never)} placeholder="ex: 60" hint="Peso padrão da saca da cultura" />
          <InputField label="N exportado" unit="kg/t" value={inputs.customN} onChange={(v) => updateInput('customN', v as never)} placeholder="ex: 15" hint="Nitrogênio removido por tonelada de grão" />
          <InputField label="P₂O₅ exportado" unit="kg/t" value={inputs.customP} onChange={(v) => updateInput('customP', v as never)} placeholder="ex: 8" hint="Fósforo removido por tonelada de grão" />
          <InputField label="K₂O exportado" unit="kg/t" value={inputs.customK} onChange={(v) => updateInput('customK', v as never)} placeholder="ex: 5" hint="Potássio removido por tonelada de grão" />
          <InputField label="S exportado" unit="kg/t" value={inputs.customS} onChange={(v) => updateInput('customS', v as never)} placeholder="ex: 2" hint="Enxofre removido por tonelada de grão" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Produtividade"
          unit="sc/ha"
          value={inputs.productivity}
          onChange={(v) => updateInput('productivity', v as never)}
          placeholder="ex: 65"
          min="0"
          required
          hint="Produtividade colhida ou esperada"
        />
        <InputField
          label="Área total (opcional)"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v as never)}
          placeholder="ex: 500"
          hint="Para calcular total da fazenda"
          min="0"
        />
      </div>

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <DataFreshness table="nutrientRemoval" label="Nutrientes" />
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.productivity} />
    </CalculatorLayout>
  )
}
