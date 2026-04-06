import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'

// ── ITR rate table (simplified) ──

// Row: area bracket index, Col: GU bracket index
const ITR_RATES = [
  // GU >= 80%  65-80%   50-65%   < 50%
  [0.03,       0.20,    0.40,    1.00],  // <= 50 ha
  [0.07,       0.40,    0.80,    2.00],  // 50-200
  [0.10,       0.60,    1.30,    3.00],  // 200-500
  [0.15,       0.85,    1.90,    4.30],  // 500-1000
  [0.45,       3.00,    5.16,    8.60],  // > 1000
]

function getAreaBracket(area: number): number {
  if (area <= 50) return 0
  if (area <= 200) return 1
  if (area <= 500) return 2
  if (area <= 1000) return 3
  return 4
}

function getGUBracket(gu: number): number {
  if (gu >= 80) return 0
  if (gu >= 65) return 1
  if (gu >= 50) return 2
  return 3
}

// ── Types ──

interface Inputs {
  totalArea: string
  usedArea: string
  vtnPerHa: string
}

interface Result {
  gu: number
  rate: number
  vtnTotal: number
  itrAnnual: number
  itrPerHa: number
  guLabel: string
}

const INITIAL: Inputs = {
  totalArea: '',
  usedArea: '',
  vtnPerHa: '',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const total = parseFloat(inputs.totalArea)
  const used = parseFloat(inputs.usedArea)
  const vtn = parseFloat(inputs.vtnPerHa)

  const gu = (used / total) * 100
  const areaBracket = getAreaBracket(total)
  const guBracket = getGUBracket(gu)
  const rate = ITR_RATES[areaBracket][guBracket]

  const vtnTotal = vtn * total
  const itrAnnual = vtnTotal * (rate / 100)
  const itrPerHa = itrAnnual / total

  const guLabels = ['≥ 80% (Alto)', '65–80% (Médio-alto)', '50–65% (Médio)', '< 50% (Baixo)']

  return {
    gu,
    rate,
    vtnTotal,
    itrAnnual,
    itrPerHa,
    guLabel: guLabels[guBracket],
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.totalArea) return 'Informe a área total'
  if (!inputs.usedArea) return 'Informe a área utilizada'
  if (!inputs.vtnPerHa) return 'Informe o VTN por hectare'
  const total = parseFloat(inputs.totalArea)
  const used = parseFloat(inputs.usedArea)
  if (used > total) return 'Área utilizada não pode ser maior que a área total'
  return null
}

// ── Component ──

export default function ITR() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Calculadora de ITR"
      description="Calcule o Imposto sobre a Propriedade Territorial Rural com base na área, utilização e valor da terra nua."
      about="Calcule o Imposto Territorial Rural (ITR) com base na área do imóvel, valor da terra nua (VTN) e grau de utilização. Quanto mais produtiva a terra, menor a alíquota."
      methodology="Alíquota definida pelo cruzamento: faixa de área total × grau de utilização (GU). VTNt = VTN × (Área total - Área não tributável). ITR = VTNt × Alíquota. Base: Lei 9.393/1996."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="ITR anual estimado"
                value={formatCurrency(result.itrAnnual)}
                prefix="R$" unit="R$/ano"
                highlight
                variant="danger"
              />
              <ResultCard
                label="ITR por hectare"
                value={formatCurrency(result.itrPerHa)}
                prefix="R$" unit="R$/ha"
                variant="warning"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Grau de utilização (GU)"
                value={formatNumber(result.gu, 1)}
                unit="%"
                variant="default"
              />
              <ResultCard
                label="Classificação GU"
                value={result.guLabel}
                unit=""
                variant="default"
              />
              <ResultCard
                label="Alíquota aplicável"
                value={formatNumber(result.rate, 2)}
                unit="%"
                variant="warning"
              />
            </div>
            <AlertBanner
              variant="info"
              message="Valores estimados. O cálculo oficial depende de declaração DIAT/DITR na Receita Federal."
            />
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Área total do imóvel"
          unit="ha"
          value={inputs.totalArea}
          onChange={(v) => updateInput('totalArea', v as never)}
          placeholder="ex: 1200"
          min="0"
          required
        />
        <InputField
          label="Área efetivamente utilizada"
          unit="ha"
          value={inputs.usedArea}
          onChange={(v) => updateInput('usedArea', v as never)}
          placeholder="ex: 1000"
          hint="Lavoura + pastagem + reflorestamento"
          min="0"
          required
        />
      </div>

      <InputField
        label="Valor da Terra Nua (VTN)"
        prefix="R$" unit="R$/ha"
        value={inputs.vtnPerHa}
        onChange={(v) => updateInput('vtnPerHa', v as never)}
        placeholder="ex: 25000"
        hint="Conforme IBGE ou avaliação"
        min="0"
        required
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
