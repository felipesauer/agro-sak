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
  producerType: string
  grossRevenue: string
  period: string
}

interface Result {
  funrural: number
  rat: number
  senar: number
  total: number
  annualProjection: number | null
}

const PRODUCER_OPTIONS = [
  { value: 'pf', label: 'Pessoa Física (PF)' },
  { value: 'pj', label: 'Pessoa Jurídica (PJ) — Agroindústria' },
]

const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'annual', label: 'Anual' },
]

// Alíquotas vigentes
const RATES: Record<string, { funrural: number; rat: number; senar: number }> = {
  pf: { funrural: 1.2, rat: 0.1, senar: 0.2 },   // Total: 1.5%
  pj: { funrural: 2.5, rat: 0.1, senar: 0.25 },   // Total: 2.85%
}

const INITIAL: Inputs = {
  producerType: 'pf',
  grossRevenue: '',
  period: 'monthly',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const revenue = parseFloat(inputs.grossRevenue)
  const rates = RATES[inputs.producerType] ?? RATES.pf

  const funrural = revenue * (rates.funrural / 100)
  const rat = revenue * (rates.rat / 100)
  const senar = revenue * (rates.senar / 100)
  const total = funrural + rat + senar

  const annualProjection = inputs.period === 'monthly' ? total * 12 : null

  return { funrural, rat, senar, total, annualProjection }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.grossRevenue || parseFloat(inputs.grossRevenue) <= 0)
    return 'Informe a receita bruta'
  return null
}

// ── Component ──

export default function Funrural() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  const rates = RATES[inputs.producerType] ?? RATES.pf
  const totalRate = rates.funrural + rates.rat + rates.senar

  return (
    <CalculatorLayout
      title="Calculadora de Funrural"
      description="Calcule a contribuição previdenciária rural (Funrural + RAT + SENAR) sobre a receita bruta."
      about="Calcule a contribuição do Funrural (INSS Rural) sobre a receita bruta da comercialização agropecuária. Inclui Funrural, RAT e SENAR, diferenciando pessoa física e jurídica."
      methodology="PF: 1,2% Funrural + 0,1% RAT + 0,2% SENAR = 1,5% total. PJ: 2,5% Funrural + 0,1% RAT + 0,25% SENAR = 2,85% total. Base legal: Lei 13.606/2018."
      result={
        result && (
          <div className="space-y-4">
            <ResultCard
              label="Total a recolher"
              value={formatCurrency(result.total)}
              unit=""
              highlight
              variant="danger"
            >
              <p className="text-xs text-gray-500 mt-1">
                Alíquota total: {formatNumber(totalRate, 2)}%
              </p>
            </ResultCard>

            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Funrural"
                value={formatCurrency(result.funrural)}
                unit=""
                variant="warning"
              >
                <p className="text-xs text-gray-500 mt-1">{formatNumber(rates.funrural, 1)}%</p>
              </ResultCard>
              <ResultCard
                label="RAT"
                value={formatCurrency(result.rat)}
                unit=""
                variant="warning"
              >
                <p className="text-xs text-gray-500 mt-1">{formatNumber(rates.rat, 1)}%</p>
              </ResultCard>
              <ResultCard
                label="SENAR"
                value={formatCurrency(result.senar)}
                unit=""
                variant="warning"
              >
                <p className="text-xs text-gray-500 mt-1">{formatNumber(rates.senar, 2)}%</p>
              </ResultCard>
            </div>

            {result.annualProjection !== null && (
              <ResultCard
                label="Projeção anual"
                value={formatCurrency(result.annualProjection)}
                unit=""
                variant="warning"
              >
                <p className="text-xs text-gray-500 mt-1">
                  Se a receita mensal se mantiver
                </p>
              </ResultCard>
            )}

            {/* Reference table */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Alíquotas vigentes
              </p>
              <ComparisonTable
                columns={[
                  { key: 'tipo', label: 'Tipo' },
                  { key: 'funrural', label: 'Funrural' },
                  { key: 'rat', label: 'RAT' },
                  { key: 'senar', label: 'SENAR' },
                  { key: 'total', label: 'Total', cellClassName: () => 'font-medium' },
                ]}
                rows={[
                  { tipo: 'PF', funrural: '1,2%', rat: '0,1%', senar: '0,2%', total: '1,5%' },
                  { tipo: 'PJ', funrural: '2,5%', rat: '0,1%', senar: '0,25%', total: '2,85%' },
                ]}
                rowKey="tipo"
              />
              <p className="text-xs text-gray-500 mt-2">
                Alíquotas vigentes desde jan/2018 (Lei 13.606/2018). Verifique atualizações na legislação.
              </p>
            </div>

            <AlertBanner
              variant="info"
              message="Receita de exportação é imune ao Funrural. Prazo de recolhimento: dia 20 do mês seguinte à venda."
            />
          </div>
        )
      }
    >
      <SelectField
        label="Tipo de produtor"
        options={PRODUCER_OPTIONS}
        value={inputs.producerType}
        onChange={(v) => updateInput('producerType', v)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Receita bruta"
          prefix="R$" mask="currency" unit="R$"
          value={inputs.grossRevenue}
          onChange={(v) => updateInput('grossRevenue', v)}
          placeholder="ex: 500000"
          step="100"
          required
          hint="Soma de todas as vendas de produção rural no período"
        />
        <SelectField
          label="Período"
          options={PERIOD_OPTIONS}
          value={inputs.period}
          onChange={(v) => updateInput('period', v)}
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.grossRevenue} />
    </CalculatorLayout>
  )
}
