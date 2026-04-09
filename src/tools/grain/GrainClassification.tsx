import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatNumber, formatPercent } from '../../utils/formatters'
import { calculateGrainClassification, validateGrainClassification, type GrainClassificationResult } from '../../core/grain/grain-classification'

// ── Types ──

interface Inputs {
  crop: string
  moisture: string
  impurities: string
  broken: string
  greenDamaged: string
  burned: string
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

function calculate(inputs: Inputs): GrainClassificationResult | null {
  return calculateGrainClassification({
    crop: inputs.crop,
    moisture: parseFloat(inputs.moisture),
    impurities: parseFloat(inputs.impurities),
    broken: parseFloat(inputs.broken),
    greenDamaged: parseFloat(inputs.greenDamaged),
    burned: parseFloat(inputs.burned),
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.moisture) return 'Informe a umidade do lote'
  if (!inputs.impurities) return 'Informe o percentual de impurezas'
  if (!inputs.broken) return 'Informe o percentual de quebrados/amassados'
  if (!inputs.greenDamaged) return 'Informe o percentual de avariados/verdes'
  if (!inputs.burned) return 'Informe o percentual de ardidos/queimados'
  return validateGrainClassification({
    crop: inputs.crop,
    moisture: parseFloat(inputs.moisture),
    impurities: parseFloat(inputs.impurities),
    broken: parseFloat(inputs.broken),
    greenDamaged: parseFloat(inputs.greenDamaged),
    burned: parseFloat(inputs.burned),
  })
}

// ── Component ──

export default function GrainClassification() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, GrainClassificationResult>({ initialInputs: INITIAL, calculate, validate })

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
          hint="Umidade medida na recepção do grão"
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
          hint="Matérias estranhas + impurezas do laudo"
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
          hint="Grãos partidos ou amassados no laudo"
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
          hint="Grãos verdes, mofados ou fermentados"
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
          hint="Grãos com alteração de cor por secagem excessiva"
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.moisture || !inputs.impurities} />
    </CalculatorLayout>
  )
}
