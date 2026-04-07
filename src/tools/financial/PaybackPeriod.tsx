import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatNumber, formatCurrency } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  investmentType: string
  investmentValue: string
  annualNetGain: string
  usefulLife: string
  residualValue: string
  discountRate: string
}

interface YearRow {
  [key: string]: unknown
  year: number
  cashFlow: number
  cumulative: number
  discountedCF: number
  cumulativeDiscounted: number
}

interface Result {
  simplePayback: number
  discountedPayback: number
  totalReturn: number
  roi: number
  npv: number
  yearRows: YearRow[]
}

// ── Constants ──

const INVESTMENT_OPTIONS = [
  { value: 'pivot', label: 'Pivô central' },
  { value: 'silo', label: 'Silo / Armazém' },
  { value: 'machinery', label: 'Máquina colhedora / Trator' },
  { value: 'dryer', label: 'Secador de grãos' },
  { value: 'solar', label: 'Energia solar' },
  { value: 'custom', label: '✦ Personalizado' },
]

const INVESTMENT_HINTS: Record<string, string> = {
  pivot: 'Pivô típico: R$5.000–8.000/ha irrigado',
  silo: 'Silo metálico: R$200–400/tonelada',
  machinery: 'Colhedora nova: R$800k–2M',
  dryer: 'Secador 100 t/h: R$300k–600k',
  solar: 'Usina rural: R$4.000–6.000/kWp',
}

const INITIAL: Inputs = {
  investmentType: 'pivot',
  investmentValue: '',
  annualNetGain: '',
  usefulLife: '15',
  residualValue: '',
  discountRate: '10',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const investment = parseFloat(inputs.investmentValue)
  const annualGain = parseFloat(inputs.annualNetGain)
  const usefulLife = parseInt(inputs.usefulLife)
  const residualValue = parseFloat(inputs.residualValue) || 0
  const rate = parseFloat(inputs.discountRate) / 100

  // Simple payback
  const simplePayback = annualGain > 0 ? investment / annualGain : Infinity

  // Build year-by-year table
  const yearRows: YearRow[] = []
  let cumulative = -investment
  let cumulativeDiscounted = -investment
  let discountedPayback = Infinity

  for (let y = 1; y <= usefulLife; y++) {
    const cf = y === usefulLife ? annualGain + residualValue : annualGain
    cumulative += cf
    const discountedCF = cf / Math.pow(1 + rate, y)
    cumulativeDiscounted += discountedCF

    if (discountedPayback === Infinity && cumulativeDiscounted >= 0) {
      // Interpolate exact year
      const prevCum = cumulativeDiscounted - discountedCF
      discountedPayback = y - 1 + Math.abs(prevCum) / discountedCF
    }

    yearRows.push({
      year: y,
      cashFlow: cf,
      cumulative,
      discountedCF,
      cumulativeDiscounted,
    })
  }

  const totalReturn = annualGain * usefulLife + residualValue
  const roi = ((totalReturn - investment) / investment) * 100
  const npv = cumulativeDiscounted

  return {
    simplePayback: simplePayback === Infinity ? -1 : simplePayback,
    discountedPayback: discountedPayback === Infinity ? -1 : discountedPayback,
    totalReturn,
    roi,
    npv,
    yearRows,
  }
}

function validate(inputs: Inputs): string | null {
  const investment = parseFloat(inputs.investmentValue)
  if (!inputs.investmentValue || isNaN(investment) || investment <= 0) return 'Informe o valor do investimento'
  if (investment > 100_000_000) return 'Valor muito alto — verifique'
  const gain = parseFloat(inputs.annualNetGain)
  if (!inputs.annualNetGain || isNaN(gain)) return 'Informe o ganho líquido anual'
  if (gain <= 0) return 'O ganho anual deve ser maior que zero'
  const life = parseInt(inputs.usefulLife)
  if (isNaN(life) || life < 1 || life > 50) return 'Vida útil deve estar entre 1 e 50 anos'
  const rate = parseFloat(inputs.discountRate)
  if (isNaN(rate) || rate < 0 || rate > 50) return 'Taxa de desconto deve estar entre 0 e 50%'
  return null
}

// ── Component ──

export default function PaybackPeriod() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  const hint = INVESTMENT_HINTS[inputs.investmentType]

  return (
    <CalculatorLayout
      title="Payback de Investimento"
      description="Calcule o tempo de retorno (payback), VPL e ROI de investimentos rurais como pivôs, silos, máquinas e energia solar."
      about="Calcule em quantos anos um investimento rural se paga, considerando o ganho líquido anual e o valor residual. Inclui payback simples, payback descontado, VPL e ROI."
      methodology="Payback simples = Investimento / Ganho anual. Payback descontado: considera o valor do dinheiro no tempo (TMA). VPL = Σ Fluxo/(1+i)^n - Investimento. ROI = (Retorno total - Investimento) / Investimento × 100."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Payback simples"
                value={result.simplePayback < 0 ? 'Nunca' : formatNumber(result.simplePayback, 1)}
                unit={result.simplePayback >= 0 ? 'anos' : ''}
                highlight
                variant={result.simplePayback >= 0 && result.simplePayback <= 5 ? 'success' : result.simplePayback >= 0 ? 'default' : 'warning'}
              />
              <ResultCard
                label="Payback descontado"
                value={result.discountedPayback < 0 ? 'Nunca' : formatNumber(result.discountedPayback, 1)}
                unit={result.discountedPayback >= 0 ? 'anos' : ''}
                highlight
                variant={result.discountedPayback >= 0 && result.discountedPayback <= 7 ? 'success' : result.discountedPayback >= 0 ? 'default' : 'warning'}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="VPL"
                value={formatCurrency(result.npv)}
                variant={result.npv >= 0 ? 'success' : 'warning'}
              />
              <ResultCard
                label="ROI total"
                value={`${formatNumber(result.roi, 1)}%`}
                variant={result.roi > 0 ? 'success' : 'warning'}
              />
              <ResultCard
                label="Retorno total"
                value={formatCurrency(result.totalReturn)}
                variant="default"
              />
            </div>

            <ComparisonTable
              columns={[
                { key: 'year', label: 'Ano' },
                { key: 'cashFlow', label: 'Fluxo', format: (v) => formatCurrency(v as number) },
                { key: 'cumulative', label: 'Acumulado', format: (v) => formatCurrency(v as number) },
                {
                  key: 'cumulativeDiscounted',
                  label: 'Acum. descontado',
                  format: (v) => formatCurrency(v as number),
                  cellClassName: (v) => (v as number) >= 0 ? 'text-green-700' : 'text-red-600',
                },
              ]}
              rows={result.yearRows}
              rowKey="year"
            />

            {result.npv < 0 && (
              <AlertBanner
                variant="warning"
                title="VPL negativo"
                message="Na taxa de desconto informada, o investimento não se paga. Reavalie premissas ou busque financiamento subsidiado (Plano Safra)."
              />
            )}

            {result.simplePayback >= 0 && result.simplePayback <= 3 && (
              <AlertBanner
                variant="success"
                title="Retorno rápido"
                message="Payback abaixo de 3 anos — investimento de alto retorno para o agronegócio."
              />
            )}
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Tipo de investimento"
          options={INVESTMENT_OPTIONS}
          value={inputs.investmentType}
          onChange={(v) => updateInput('investmentType', v as never)}
        />
        <InputField
          label="Valor do investimento"
          unit="R$"
          value={inputs.investmentValue}
          onChange={(v) => updateInput('investmentValue', v as never)}
          placeholder="ex: 1500000"
          min="0"
          max="100000000"
          hint={hint}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Ganho líquido anual"
          unit="R$/ano"
          value={inputs.annualNetGain}
          onChange={(v) => updateInput('annualNetGain', v as never)}
          placeholder="ex: 250000"
          min="0"
          hint="Receita adicional − custos operacionais adicionais"
          required
        />
        <InputField
          label="Vida útil"
          unit="anos"
          value={inputs.usefulLife}
          onChange={(v) => updateInput('usefulLife', v as never)}
          placeholder="ex: 15"
          min="1"
          max="50"
          required
          hint="Tempo estimado de uso do equipamento ou benfeitoria"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Valor residual"
          unit="R$"
          value={inputs.residualValue}
          onChange={(v) => updateInput('residualValue', v as never)}
          placeholder="ex: 200000"
          hint="Valor de revenda ao final da vida útil"
          min="0"
        />
        <InputField
          label="Taxa de desconto (TMA)"
          unit="% a.a."
          value={inputs.discountRate}
          onChange={(v) => updateInput('discountRate', v as never)}
          placeholder="ex: 10"
          min="0"
          max="50"
          hint="Custo de oportunidade do capital"
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.investmentValue || !inputs.annualNetGain} />
    </CalculatorLayout>
  )
}
