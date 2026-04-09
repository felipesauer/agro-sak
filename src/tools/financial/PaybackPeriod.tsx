import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { calculatePayback, validatePayback, type PaybackResult } from '../../core/financial/payback'

// ── Types ──

interface Inputs {
  investmentType: string
  investmentValue: string
  annualNetGain: string
  usefulLife: string
  residualValue: string
  discountRate: string
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

function calculate(inputs: Inputs): PaybackResult | null {
  return calculatePayback({
    investmentValue: parseFloat(inputs.investmentValue) || 0,
    annualNetGain: parseFloat(inputs.annualNetGain) || 0,
    usefulLifeYears: parseInt(inputs.usefulLife) || 15,
    residualValue: parseFloat(inputs.residualValue) || 0,
    discountRatePercent: parseFloat(inputs.discountRate) || 10,
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.investmentValue || isNaN(parseFloat(inputs.investmentValue))) return 'Informe o valor do investimento'
  return validatePayback({
    investmentValue: parseFloat(inputs.investmentValue) || 0,
    annualNetGain: parseFloat(inputs.annualNetGain) || 0,
    usefulLifeYears: parseInt(inputs.usefulLife) || 15,
    residualValue: parseFloat(inputs.residualValue) || 0,
    discountRatePercent: parseFloat(inputs.discountRate) || 10,
  })
}

// ── Component ──

export default function PaybackPeriod() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, PaybackResult>({ initialInputs: INITIAL, calculate, validate })

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
