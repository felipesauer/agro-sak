import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatPercent } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  investment: string
  grossRevenue: string
  totalCost: string
  months: string
  cdiRate: string
}

interface Result {
  profit: number
  roi: number
  roiAnnualized: number
  cdiReturn: number
  cdiAnnual: number
}

const INITIAL: Inputs = {
  investment: '4200000',
  grossRevenue: '5980000',
  totalCost: '4200000',
  months: '8',
  cdiRate: '13.75',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const investment = parseFloat(inputs.investment)
  const revenue = parseFloat(inputs.grossRevenue)
  const cost = parseFloat(inputs.totalCost)
  const months = parseFloat(inputs.months) || 8
  const cdiAnnual = parseFloat(inputs.cdiRate) || 13.75

  const profit = revenue - cost
  const roi = investment > 0 ? (profit / investment) * 100 : 0
  const roiAnnualized = months > 0
    ? (Math.pow(1 + roi / 100, 12 / months) - 1) * 100
    : 0

  // CDI comparison: what the same investment would return in a CDB 100% CDI
  const cdiMonthly = Math.pow(1 + cdiAnnual / 100, 1 / 12) - 1
  const cdiReturn = investment * (Math.pow(1 + cdiMonthly, months) - 1)

  return { profit, roi, roiAnnualized, cdiReturn, cdiAnnual }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.investment || parseFloat(inputs.investment) <= 0)
    return 'Informe o investimento total'
  if (!inputs.grossRevenue) return 'Informe a receita bruta projetada'
  if (!inputs.totalCost) return 'Informe o custo total'
  if (!inputs.months || parseFloat(inputs.months) <= 0) return 'Informe o prazo da operação'
  return null
}

// ── Component ──

export default function FarmROI() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="ROI Agrícola"
      description="Calcule o retorno sobre investimento da safra e compare com alternativas financeiras."
      about="Calcule o retorno sobre o investimento (ROI) da safra e compare com aplicações financeiras como CDI. Descubra se a atividade agrícola está remunerando adequadamente o capital."
      methodology="ROI = (Receita líquida - Custo total) / Custo total × 100. Comparação com CDI: Rendimento CDI = Capital × (1 + CDI%)^(meses/12) - Capital."
      result={
        result && (
          <div className="space-y-4">
            <ResultCard
              label={result.profit >= 0 ? 'Lucro da safra' : 'Prejuízo da safra'}
              value={formatCurrency(result.profit, 0)}
              unit=""
              highlight
              variant={result.profit >= 0 ? 'success' : 'danger'}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="ROI da safra"
                value={formatPercent(result.roi)}
                unit=""
                highlight
                variant="success"
              >
                <p className="text-xs text-gray-500 mt-1">
                  Em {inputs.months} meses
                </p>
              </ResultCard>
              <ResultCard
                label="ROI anualizado"
                value={formatPercent(result.roiAnnualized)}
                unit=""
                variant="success"
              />
            </div>

            {/* CDI comparison */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Comparativo com CDB 100% CDI ({formatPercent(result.cdiAnnual, 2)} a.a.)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Safra ({inputs.months} meses)</p>
                  <p className={`text-lg font-bold ${result.profit >= 0 ? 'text-agro-700' : 'text-red-600'}`}>
                    {formatCurrency(result.profit, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CDB ({inputs.months} meses bruto)</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(result.cdiReturn, 0)}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                {result.profit > result.cdiReturn ? (
                  <p className="text-xs text-agro-700 font-medium">
                    A safra rende {formatCurrency(result.profit - result.cdiReturn, 0)} a mais que o CDB.
                  </p>
                ) : (
                  <p className="text-xs text-red-600 font-medium">
                    O CDB renderia {formatCurrency(result.cdiReturn - result.profit, 0)} a mais que a safra.
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  CDB mostrado como rendimento bruto. O rendimento líquido é menor após IR (15–22,5% conforme prazo).
                </p>
              </div>
            </div>

            {result.roi < 0 && (
              <AlertBanner
                variant="error"
                message="ROI negativo — a safra não cobre o investimento com os valores informados."
              />
            )}
          </div>
        )
      }
    >
      <InputField
        label="Investimento total"
        prefix="R$" mask="currency" unit="R$"
        value={inputs.investment}
        onChange={(v) => updateInput('investment', v)}
        placeholder="ex: 4200000"
        step="10000"
        required
        hint="Capital aplicado na safra (terra, insumos, operações)"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Receita bruta projetada"
          prefix="R$" mask="currency" unit="R$"
          value={inputs.grossRevenue}
          onChange={(v) => updateInput('grossRevenue', v)}
          placeholder="ex: 5980000"
          step="10000"
          required
          hint="Faturamento esperado com a venda da produção"
        />
        <InputField
          label="Custo total"
          prefix="R$" mask="currency" unit="R$"
          value={inputs.totalCost}
          onChange={(v) => updateInput('totalCost', v)}
          placeholder="ex: 4200000"
          step="10000"
          required
          hint="Soma de todos os gastos diretos e indiretos da safra"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Prazo da operação"
          unit="meses"
          value={inputs.months}
          onChange={(v) => updateInput('months', v)}
          placeholder="ex: 8"
          required
          hint="Duração do ciclo completo, do plantio à venda"
        />
        <InputField
          label="Taxa CDI anual (referência)"
          unit="% a.a."
          value={inputs.cdiRate}
          onChange={(v) => updateInput('cdiRate', v)}
          placeholder="ex: 13.75"
          step="0.25"
          hint="Para comparativo com aplicação financeira"
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.investment || !inputs.grossRevenue || !inputs.totalCost} />
    </CalculatorLayout>
  )
}
