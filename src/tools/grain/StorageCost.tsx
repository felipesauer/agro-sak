import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  // Terceiro
  thirdPartyFee: string
  volumeAnnual: string
  avgMonths: string
  // Próprio
  siloCapacity: string
  constructionCost: string
  siloLifeYears: string
  annualOpCost: string
}

interface Result {
  thirdPartyCostSc: number
  thirdPartyTotal: number
  ownCostSc: number
  ownTotal: number
  breakEvenYears: number
  annualSavings: number
}

const INITIAL: Inputs = {
  thirdPartyFee: '0.45',
  volumeAnnual: '15000',
  avgMonths: '4',
  siloCapacity: '20000',
  constructionCost: '1500000',
  siloLifeYears: '25',
  annualOpCost: '80000',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const fee = parseFloat(inputs.thirdPartyFee)
  const vol = parseFloat(inputs.volumeAnnual)
  const months = parseFloat(inputs.avgMonths)
  const constCost = parseFloat(inputs.constructionCost)
  const life = parseFloat(inputs.siloLifeYears)
  const opCost = parseFloat(inputs.annualOpCost)

  const thirdPartyCostSc = fee * months
  const thirdPartyTotal = thirdPartyCostSc * vol

  const annualDepr = constCost / life
  const ownTotal = annualDepr + opCost
  const ownCostSc = vol > 0 ? ownTotal / vol : 0

  const annualSavings = thirdPartyTotal - ownTotal
  const breakEvenYears = annualSavings > 0 ? constCost / annualSavings : Infinity

  return {
    thirdPartyCostSc,
    thirdPartyTotal,
    ownCostSc,
    ownTotal,
    breakEvenYears: breakEvenYears === Infinity ? 0 : Math.ceil(breakEvenYears),
    annualSavings,
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.thirdPartyFee || parseFloat(inputs.thirdPartyFee) <= 0) return 'Informe a taxa de armazenagem'
  if (!inputs.volumeAnnual || parseFloat(inputs.volumeAnnual) <= 0) return 'Informe o volume anual'
  if (!inputs.constructionCost || parseFloat(inputs.constructionCost) <= 0) return 'Informe o custo de construção do silo'
  return null
}

// ── Component ──

export default function StorageCost() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Custo de Armazenagem"
      description="Compare o custo de silo próprio versus armazém de terceiros e veja em quanto tempo o investimento se paga."
      about="Compare o custo de armazenar grãos em silo próprio versus silo de terceiros (cooperativa/armazém geral). Considere depreciação, manutenção e taxas."
      methodology="Silo próprio: Custo = (Investimento / Vida útil + Manutenção + Energia) / Capacidade. Terceiros: Custo = Tarifa mensal × Meses. Ponto de equilíbrio em volume e tempo."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={`rounded-lg border p-4 ${result.thirdPartyCostSc > result.ownCostSc ? 'bg-gray-50 border-gray-200' : 'bg-agro-50 border-agro-300'}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Armazém Terceiro</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(result.thirdPartyCostSc)}<span className="text-sm font-normal text-gray-500 ml-1">/sc</span></p>
                <p className="text-xs text-gray-500 mt-1">Total anual: {formatCurrency(result.thirdPartyTotal, 0)}</p>
                {result.thirdPartyCostSc <= result.ownCostSc && <span className="text-xs text-agro-700 font-medium">✓ Mais econômico</span>}
              </div>
              <div className={`rounded-lg border p-4 ${result.ownCostSc < result.thirdPartyCostSc ? 'bg-agro-50 border-agro-300' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Silo Próprio</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(result.ownCostSc)}<span className="text-sm font-normal text-gray-500 ml-1">/sc</span></p>
                <p className="text-xs text-gray-500 mt-1">Total anual: {formatCurrency(result.ownTotal, 0)}</p>
                {result.ownCostSc < result.thirdPartyCostSc && <span className="text-xs text-agro-700 font-medium">✓ Mais econômico</span>}
              </div>
            </div>

            {result.annualSavings > 0 ? (
              <>
                <ResultCard label="Economia anual com silo próprio" value={formatCurrency(result.annualSavings, 0)} unit="/ano" highlight variant="success" />
                <ResultCard label="Break-even do investimento" value={`${result.breakEvenYears}`} unit="anos" variant="default">
                  <p className="text-xs text-gray-500 mt-1">
                    Investimento: {formatCurrency(parseFloat(inputs.constructionCost), 0)}
                  </p>
                </ResultCard>
              </>
            ) : (
              <AlertBanner
                variant="info"
                message="O armazém de terceiros é mais econômico com os volumes e custos informados."
              />
            )}
          </div>
        )
      }
    >
      <p className="text-sm font-medium text-gray-700 mb-2">Armazém de Terceiro</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <InputField label="Taxa cobrada" prefix="R$" unit="R$/sc/mês" value={inputs.thirdPartyFee} onChange={(v) => updateInput('thirdPartyFee', v)} step="0.05" required />
        <InputField label="Volume anual" unit="sc" value={inputs.volumeAnnual} onChange={(v) => updateInput('volumeAnnual', v)} step="500" required />
        <InputField label="Prazo médio" unit="meses" value={inputs.avgMonths} onChange={(v) => updateInput('avgMonths', v)} />
      </div>

      <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Silo Próprio</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="Capacidade do silo" unit="sc" value={inputs.siloCapacity} onChange={(v) => updateInput('siloCapacity', v)} step="1000" />
        <InputField label="Custo de construção" prefix="R$" unit="R$" value={inputs.constructionCost} onChange={(v) => updateInput('constructionCost', v)} step="10000" required />
        <InputField label="Vida útil" unit="anos" value={inputs.siloLifeYears} onChange={(v) => updateInput('siloLifeYears', v)} />
        <InputField label="Custo operacional anual" prefix="R$" unit="R$/ano" value={inputs.annualOpCost} onChange={(v) => updateInput('annualOpCost', v)} step="1000" />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
