import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'
import { NUTRIENT_REMOVAL, cropOptionsFrom } from '../../data/reference-data'
import { BAG_WEIGHT_KG } from '../../utils/conversions'

// ── Types ──

interface Inputs {
  crop: string
  productivity: string
  part: string
  area: string
  priceN: string
  priceP: string
  priceK: string
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
}

const CROP_OPTIONS = cropOptionsFrom(NUTRIENT_REMOVAL)

const PART_OPTIONS = [
  { value: 'grain', label: 'Apenas grão' },
  { value: 'grain_straw', label: 'Grão + palhada (+30%)' },
]

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const prod = parseFloat(inputs.productivity)
  const bagKg = BAG_WEIGHT_KG[inputs.crop] ?? 60
  const tonsPerHa = (prod * bagKg) / 1000

  const removal = NUTRIENT_REMOVAL[inputs.crop]
  if (!removal) return null

  const strawFactor = inputs.part === 'grain_straw' ? 1.3 : 1
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
  if (parseFloat(inputs.productivity) <= 0) return 'Produtividade deve ser positiva'
  return null
}

// ── Component ──

export default function NutrientRemoval() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Exportação de Nutrientes"
      description="Calcule a quantidade de nutrientes removidos do solo pela colheita e planeje a adubação de reposição."
      result={
        result && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-agro-50 text-left">
                    <th className="p-2 border border-agro-200">Nutriente</th>
                    <th className="p-2 border border-agro-200">kg/ha</th>
                    {result.totalArea && (
                      <>
                        <th className="p-2 border border-agro-200">Total (kg)</th>
                        <th className="p-2 border border-agro-200">Total (t)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.nutrient}>
                      <td className="p-2 border border-agro-200 font-medium">{row.nutrient}</td>
                      <td className="p-2 border border-agro-200">{formatNumber(row.kgPerHa, 1)}</td>
                      {result.totalArea && (
                        <>
                          <td className="p-2 border border-agro-200">{formatNumber(row.totalKg!, 0)}</td>
                          <td className="p-2 border border-agro-200">{formatNumber(row.totalKg! / 1000, 2)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
          options={CROP_OPTIONS}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Produtividade"
          unit="sc/ha"
          value={inputs.productivity}
          onChange={(v) => updateInput('productivity', v as never)}
          placeholder="ex: 65"
          min="0"
          required
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

      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
