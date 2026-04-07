import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  crop: string
  zn: string
  b: string
  cu: string
  mn: string
  area: string
}

type NutrientStatus = 'Baixo' | 'Médio' | 'Alto'

interface NutrientResult {
  name: string
  symbol: string
  value: number
  status: NutrientStatus
  doseKgHa: number
  totalKg: number
}

interface Result {
  nutrients: NutrientResult[]
}

const CROP_OPTIONS = [
  { value: 'soybean', label: 'Soja' },
  { value: 'corn', label: 'Milho' },
  { value: 'cotton', label: 'Algodão' },
  { value: 'coffee', label: 'Café' },
  { value: 'wheat', label: 'Trigo' },
  { value: 'sugarcane', label: 'Cana-de-açúcar' },
]

// EMBRAPA classification thresholds (mg/dm³)
const THRESHOLDS: Record<string, { low: number; high: number }> = {
  zn: { low: 0.5, high: 1.0 },
  b: { low: 0.2, high: 0.6 },
  cu: { low: 0.3, high: 0.8 },
  mn: { low: 1.5, high: 5.0 },
}

// Recommended doses (kg/ha of active nutrient) per classification
const DOSES: Record<string, Record<string, Record<NutrientStatus, number>>> = {
  soybean: {
    zn: { Baixo: 6, Médio: 3, Alto: 0 },
    b: { Baixo: 2, Médio: 1, Alto: 0 },
    cu: { Baixo: 3, Médio: 1.5, Alto: 0 },
    mn: { Baixo: 6, Médio: 3, Alto: 0 },
  },
  corn: {
    zn: { Baixo: 6, Médio: 3, Alto: 0 },
    b: { Baixo: 1.5, Médio: 0.5, Alto: 0 },
    cu: { Baixo: 3, Médio: 1.5, Alto: 0 },
    mn: { Baixo: 6, Médio: 3, Alto: 0 },
  },
  cotton: {
    zn: { Baixo: 6, Médio: 3, Alto: 0 },
    b: { Baixo: 3, Médio: 1.5, Alto: 0 },
    cu: { Baixo: 3, Médio: 1.5, Alto: 0 },
    mn: { Baixo: 6, Médio: 3, Alto: 0 },
  },
  coffee: {
    zn: { Baixo: 8, Médio: 4, Alto: 0 },
    b: { Baixo: 3, Médio: 1.5, Alto: 0 },
    cu: { Baixo: 4, Médio: 2, Alto: 0 },
    mn: { Baixo: 8, Médio: 4, Alto: 0 },
  },
  wheat: {
    zn: { Baixo: 5, Médio: 2.5, Alto: 0 },
    b: { Baixo: 1.5, Médio: 0.5, Alto: 0 },
    cu: { Baixo: 2, Médio: 1, Alto: 0 },
    mn: { Baixo: 5, Médio: 2.5, Alto: 0 },
  },
  sugarcane: {
    zn: { Baixo: 6, Médio: 3, Alto: 0 },
    b: { Baixo: 2, Médio: 1, Alto: 0 },
    cu: { Baixo: 3, Médio: 1.5, Alto: 0 },
    mn: { Baixo: 8, Médio: 4, Alto: 0 },
  },
}

const INITIAL: Inputs = {
  crop: 'soybean',
  zn: '0.4',
  b: '0.15',
  cu: '0.5',
  mn: '2.0',
  area: '100',
}

// ── Calculation ──

function classify(nutrient: string, value: number): NutrientStatus {
  const t = THRESHOLDS[nutrient]
  if (value < t.low) return 'Baixo'
  if (value >= t.high) return 'Alto'
  return 'Médio'
}

function calculate(inputs: Inputs): Result | null {
  const area = parseFloat(inputs.area)
  const crop = inputs.crop

  const nutrientKeys: { key: keyof Inputs; name: string; symbol: string }[] = [
    { key: 'zn', name: 'Zinco', symbol: 'Zn' },
    { key: 'b', name: 'Boro', symbol: 'B' },
    { key: 'cu', name: 'Cobre', symbol: 'Cu' },
    { key: 'mn', name: 'Manganês', symbol: 'Mn' },
  ]

  const nutrients: NutrientResult[] = nutrientKeys.map(({ key, name, symbol }) => {
    const value = parseFloat(inputs[key]) || 0
    const status = classify(key, value)
    const cropDoses = DOSES[crop]
    const doseKgHa = cropDoses?.[key]?.[status] ?? 0
    const totalKg = doseKgHa * area

    return { name, symbol, value, status, doseKgHa, totalKg }
  })

  return { nutrients }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.crop) return 'Selecione a cultura'
  if (!inputs.area || parseFloat(inputs.area) <= 0) return 'Informe a área'
  if (!inputs.zn && !inputs.b && !inputs.cu && !inputs.mn)
    return 'Informe ao menos um micronutriente'
  return null
}

// ── Component ──

export default function MicronutrientCorrection() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  const statusColor = (s: NutrientStatus) =>
    s === 'Baixo' ? 'text-red-600' : s === 'Médio' ? 'text-yellow-600' : 'text-green-600'

  return (
    <CalculatorLayout
      title="Correção de Micronutrientes"
      description="Recomendação de micronutrientes (Zn, B, Cu, Mn) com base na análise de solo e cultura."
      about="Interprete os teores de micronutrientes do solo e obtenha a dose recomendada por hectare para cada nutriente, conforme tabelas EMBRAPA. Evite deficiências que limitam a produtividade."
      methodology="Classificação em Baixo/Médio/Alto conforme faixas EMBRAPA (DTPA e água quente). Doses de aplicação em kg/ha de nutriente ativo conforme cultura e classificação."
      result={
        result && (
          <div className="space-y-4">
            <ResultCard
              label="Diagnóstico de micronutrientes"
              value={`${result.nutrients.filter(n => n.status === 'Baixo').length} deficiente(s)`}
              unit=""
              highlight
              variant={result.nutrients.some(n => n.status === 'Baixo') ? 'danger' : 'success'}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2">Nutriente</th>
                    <th className="text-center py-2 px-2">Teor (mg/dm³)</th>
                    <th className="text-center py-2 px-2">Classificação</th>
                    <th className="text-center py-2 px-2">Dose (kg/ha)</th>
                    <th className="text-right py-2 px-2">Total (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.nutrients.map((n) => (
                    <tr key={n.symbol} className="border-b border-gray-100">
                      <td className="py-2 px-2 font-medium">{n.name} ({n.symbol})</td>
                      <td className="text-center py-2 px-2">{formatNumber(n.value, 2)}</td>
                      <td className={`text-center py-2 px-2 font-semibold ${statusColor(n.status)}`}>{n.status}</td>
                      <td className="text-center py-2 px-2">{formatNumber(n.doseKgHa, 1)}</td>
                      <td className="text-right py-2 px-2">{formatNumber(n.totalKg, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.nutrients.some(n => n.status === 'Baixo') && (
              <AlertBanner
                variant="warning"
                message="Há micronutrientes com teor baixo. A correção via solo é recomendada antes do plantio."
              />
            )}

            {result.nutrients.every(n => n.status === 'Alto') && (
              <AlertBanner
                variant="success"
                message="Todos os micronutrientes estão em nível adequado. Não é necessário corrigir."
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
        onChange={(v) => updateInput('crop', v)}
      />

      <InputField
        label="Área"
        unit="ha"
        value={inputs.area}
        onChange={(v) => updateInput('area', v)}
        placeholder="ex: 100"
        hint="Área total a ser corrigida"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Zinco (Zn)"
          unit="mg/dm³"
          value={inputs.zn}
          onChange={(v) => updateInput('zn', v)}
          placeholder="ex: 0.4"
          hint="Teor de zinco na análise de solo (DTPA)"
        />
        <InputField
          label="Boro (B)"
          unit="mg/dm³"
          value={inputs.b}
          onChange={(v) => updateInput('b', v)}
          placeholder="ex: 0.15"
          hint="Teor de boro na análise de solo (água quente)"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Cobre (Cu)"
          unit="mg/dm³"
          value={inputs.cu}
          onChange={(v) => updateInput('cu', v)}
          placeholder="ex: 0.5"
          hint="Teor de cobre na análise de solo (DTPA)"
        />
        <InputField
          label="Manganês (Mn)"
          unit="mg/dm³"
          value={inputs.mn}
          onChange={(v) => updateInput('mn', v)}
          placeholder="ex: 2.0"
          hint="Teor de manganês na análise de solo (DTPA)"
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area} />
    </CalculatorLayout>
  )
}
