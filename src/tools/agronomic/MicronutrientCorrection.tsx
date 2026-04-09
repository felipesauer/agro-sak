import useCalculator from '../../hooks/useCalculator'
import { calculateMicronutrientCorrection, validateMicronutrientCorrection, type MicronutrientCorrectionResult, type NutrientStatus } from '../../core/agronomic/micronutrient-correction'
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

const CROP_OPTIONS = [
  { value: 'soybean', label: 'Soja' },
  { value: 'corn', label: 'Milho' },
  { value: 'cotton', label: 'Algodão' },
  { value: 'coffee', label: 'Café' },
  { value: 'wheat', label: 'Trigo' },
  { value: 'sugarcane', label: 'Cana-de-açúcar' },
]

const INITIAL: Inputs = {
  crop: 'soybean',
  zn: '0.4',
  b: '0.15',
  cu: '0.5',
  mn: '2.0',
  area: '100',
}

// ── Calculation ──

function calculate(inputs: Inputs): MicronutrientCorrectionResult | null {
  return calculateMicronutrientCorrection({
    crop: inputs.crop,
    areaHa: parseFloat(inputs.area),
    zn: inputs.zn ? parseFloat(inputs.zn) : undefined,
    b: inputs.b ? parseFloat(inputs.b) : undefined,
    cu: inputs.cu ? parseFloat(inputs.cu) : undefined,
    mn: inputs.mn ? parseFloat(inputs.mn) : undefined,
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.crop) return 'Selecione a cultura'
  if (!inputs.area || parseFloat(inputs.area) <= 0) return 'Informe a área'
  return validateMicronutrientCorrection({
    crop: inputs.crop,
    areaHa: parseFloat(inputs.area),
    zn: inputs.zn ? parseFloat(inputs.zn) : undefined,
    b: inputs.b ? parseFloat(inputs.b) : undefined,
    cu: inputs.cu ? parseFloat(inputs.cu) : undefined,
    mn: inputs.mn ? parseFloat(inputs.mn) : undefined,
  })
}

// ── Component ──

export default function MicronutrientCorrection() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, MicronutrientCorrectionResult>({ initialInputs: INITIAL, calculate, validate })

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

            <AlertBanner
              variant="info"
              message="As faixas de classificação assumem extração por DTPA (Zn, Cu, Mn) e água quente (B). Se o laudo usar Mehlich-1, os valores de referência podem diferir."
            />
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
