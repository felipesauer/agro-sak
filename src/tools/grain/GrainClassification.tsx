import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatNumber, formatPercent } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  crop: string
  moisture: string
  impurities: string
  broken: string
  greenDamaged: string
  burned: string
}

interface DefectRow {
  [key: string]: unknown
  defect: string
  measured: number
  limit: number
  status: string
}

interface Result {
  type: number
  typeName: string
  approved: boolean
  discountMoisture: number
  discountImpurities: number
  totalDiscount: number
  defects: DefectRow[]
  alerts: string[]
}

// ── Classification tables (IN 11/2007 MAPA — Soja | IN 60/2011 — Milho) ──

interface CropLimits {
  moisture: number
  impurities: number
  broken: number[]       // [Type1, Type2, Type3]
  greenDamaged: number[]
  burned: number[]
  baseMoisture: number
  baseImpurities: number
}

const LIMITS: Record<string, CropLimits> = {
  soybean: {
    moisture: 14,
    impurities: 1,
    broken: [8, 15, 30],
    greenDamaged: [8, 15, 30],
    burned: [1, 2, 5],
    baseMoisture: 14,
    baseImpurities: 1,
  },
  corn: {
    moisture: 14,
    impurities: 1,
    broken: [3, 6, 15],
    greenDamaged: [6, 10, 20],
    burned: [0.5, 1, 3],
    baseMoisture: 14,
    baseImpurities: 1,
  },
}

const CROP_OPTIONS = [
  { value: 'soybean', label: 'Soja' },
  { value: 'corn', label: 'Milho' },
]

const INITIAL: Inputs = {
  crop: 'soybean',
  moisture: '',
  impurities: '',
  broken: '',
  greenDamaged: '',
  burned: '',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const limits = LIMITS[inputs.crop]
  if (!limits) return null

  const moisture = parseFloat(inputs.moisture)
  const impurities = parseFloat(inputs.impurities)
  const broken = parseFloat(inputs.broken)
  const greenDamaged = parseFloat(inputs.greenDamaged)
  const burned = parseFloat(inputs.burned)

  // Determine type (1, 2, 3 or rejected)
  let type = 0
  for (let t = 0; t < 3; t++) {
    if (
      broken <= limits.broken[t] &&
      greenDamaged <= limits.greenDamaged[t] &&
      burned <= limits.burned[t]
    ) {
      type = t + 1
      break
    }
  }

  const approved = type > 0
  const typeName = approved ? `Tipo ${type}` : 'Fora de padrão'

  // Discounts
  const discountMoisture = moisture > limits.baseMoisture
    ? (moisture - limits.baseMoisture) * 1.5  // ~1.5% per point above base
    : 0
  const discountImpurities = impurities > limits.baseImpurities
    ? (impurities - limits.baseImpurities) * 1.0
    : 0
  const totalDiscount = discountMoisture + discountImpurities

  // Defect rows for table
  const defects: DefectRow[] = [
    {
      defect: 'Umidade',
      measured: moisture,
      limit: limits.baseMoisture,
      status: moisture <= limits.baseMoisture ? '✓ OK' : `↑ Desc. ${formatNumber(discountMoisture, 1)}%`,
    },
    {
      defect: 'Impurezas',
      measured: impurities,
      limit: limits.baseImpurities,
      status: impurities <= limits.baseImpurities ? '✓ OK' : `↑ Desc. ${formatNumber(discountImpurities, 1)}%`,
    },
    {
      defect: 'Quebrados/Amassados',
      measured: broken,
      limit: type > 0 ? limits.broken[type - 1] : limits.broken[2],
      status: type > 0 && broken <= limits.broken[type - 1] ? '✓ OK' : '✗ Excede',
    },
    {
      defect: 'Avariados/Verdes',
      measured: greenDamaged,
      limit: type > 0 ? limits.greenDamaged[type - 1] : limits.greenDamaged[2],
      status: type > 0 && greenDamaged <= limits.greenDamaged[type - 1] ? '✓ OK' : '✗ Excede',
    },
    {
      defect: 'Ardidos/Queimados',
      measured: burned,
      limit: type > 0 ? limits.burned[type - 1] : limits.burned[2],
      status: type > 0 && burned <= limits.burned[type - 1] ? '✓ OK' : '✗ Excede',
    },
  ]

  // Alerts
  const alerts: string[] = []
  if (!approved) alerts.push('Lote fora de padrão comercial — pode sofrer deságio significativo ou recusa.')
  if (moisture > 18) alerts.push('Umidade muito alta (> 18%). Secagem urgente recomendada antes de armazenar ou comercializar.')
  if (burned > limits.burned[0]) alerts.push('Teor de grãos ardidos/queimados acima do Tipo 1. Segregue lotes na colheita.')

  return { type, typeName, approved, discountMoisture, discountImpurities, totalDiscount, defects, alerts }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.moisture) return 'Informe a umidade do lote'
  if (!inputs.impurities) return 'Informe o percentual de impurezas'
  if (!inputs.broken) return 'Informe o percentual de quebrados/amassados'
  if (!inputs.greenDamaged) return 'Informe o percentual de avariados/verdes'
  if (!inputs.burned) return 'Informe o percentual de ardidos/queimados'
  const m = parseFloat(inputs.moisture)
  if (isNaN(m) || m < 0 || m > 40) return 'Umidade deve estar entre 0 e 40%'
  return null
}

// ── Component ──

export default function GrainClassification() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Classificação de Grãos"
      description="Classifique seu lote de soja ou milho conforme os padrões oficiais do MAPA (Instrução Normativa) e calcule descontos por umidade e impurezas."
      about="Classifique o lote de grãos conforme os tipos oficiais do MAPA (IN 11/2007 para soja, IN 60/2011 para milho). Descubra se o lote é Tipo 1, 2 ou 3 e calcule os descontos aplicados pela trading/armazém."
      methodology="Classificação por limites de defeitos (quebrados, avariados, ardidos) conforme IN MAPA. Desconto de umidade: ~1,5% por ponto acima de 14%. Desconto de impurezas: 1% por ponto acima de 1%. Fontes: MAPA IN 11/2007, IN 60/2011, CONAB."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Classificação"
                value={result.typeName}
                highlight
                variant={result.approved ? 'success' : 'warning'}
              />
              <ResultCard
                label="Desconto total estimado"
                value={formatPercent(result.totalDiscount)}
                variant={result.totalDiscount > 0 ? 'warning' : 'success'}
              />
            </div>

            <ComparisonTable
              columns={[
                { key: 'defect', label: 'Defeito/Parâmetro' },
                { key: 'measured', label: 'Medido (%)', format: (v) => formatNumber(v as number, 1) },
                { key: 'limit', label: 'Limite (%)', format: (v) => formatNumber(v as number, 1) },
                {
                  key: 'status',
                  label: 'Status',
                  cellClassName: (v) => (v as string).startsWith('✓') ? 'text-green-700' : 'text-red-600',
                },
              ]}
              rows={result.defects}
              rowKey="defect"
            />

            {result.alerts.map((alert) => (
              <AlertBanner key={alert} variant="warning" message={alert} />
            ))}

            {result.approved && result.totalDiscount === 0 && (
              <AlertBanner variant="success" message="Lote dentro dos padrões de umidade e impurezas — sem descontos." />
            )}
          </div>
        )
      }
    >
      <SelectField
        label="Cultura"
        options={CROP_OPTIONS}
        value={inputs.crop}
        onChange={(v) => updateInput('crop', v as never)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Umidade"
          unit="%"
          value={inputs.moisture}
          onChange={(v) => updateInput('moisture', v as never)}
          placeholder="ex: 15.5"
          step="0.1"
          min="0"
          max="40"
          required
        />
        <InputField
          label="Impurezas"
          unit="%"
          value={inputs.impurities}
          onChange={(v) => updateInput('impurities', v as never)}
          placeholder="ex: 1.2"
          step="0.1"
          min="0"
          max="20"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Quebrados/Amassados"
          unit="%"
          value={inputs.broken}
          onChange={(v) => updateInput('broken', v as never)}
          placeholder="ex: 5"
          step="0.1"
          min="0"
          max="100"
          required
        />
        <InputField
          label="Avariados/Verdes"
          unit="%"
          value={inputs.greenDamaged}
          onChange={(v) => updateInput('greenDamaged', v as never)}
          placeholder="ex: 6"
          step="0.1"
          min="0"
          max="100"
          required
        />
        <InputField
          label="Ardidos/Queimados"
          unit="%"
          value={inputs.burned}
          onChange={(v) => updateInput('burned', v as never)}
          placeholder="ex: 0.5"
          step="0.1"
          min="0"
          max="100"
          required
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
