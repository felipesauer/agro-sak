import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency } from '../../utils/formatters'
import { calculateStorageCost, validateStorageCost, type StorageCostResult } from '../../core/grain/storage-cost'

// ── Types ──

interface Inputs {
  thirdPartyFee: string
  volumeAnnual: string
  avgMonths: string
  siloCapacity: string
  constructionCost: string
  siloLifeYears: string
  annualOpCost: string
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

function calculate(inputs: Inputs): StorageCostResult | null {
  return calculateStorageCost({
    thirdPartyFeePerScMonth: parseFloat(inputs.thirdPartyFee),
    volumeAnnualSc: parseFloat(inputs.volumeAnnual),
    avgMonths: parseFloat(inputs.avgMonths),
    constructionCost: parseFloat(inputs.constructionCost),
    siloLifeYears: parseFloat(inputs.siloLifeYears),
    annualOpCost: parseFloat(inputs.annualOpCost),
  })
}

function validate(inputs: Inputs): string | null {
  return validateStorageCost({
    thirdPartyFeePerScMonth: parseFloat(inputs.thirdPartyFee),
    volumeAnnualSc: parseFloat(inputs.volumeAnnual),
    constructionCost: parseFloat(inputs.constructionCost),
  })
}

// ── Component ──

export default function StorageCost() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, StorageCostResult>({ initialInputs: INITIAL, calculate, validate })

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
        <InputField label="Taxa cobrada" prefix="R$" mask="currency" unit="R$/sc/mês" value={inputs.thirdPartyFee} onChange={(v) => updateInput('thirdPartyFee', v)} step="0.05" required hint="Valor cobrado pelo armazém terceirizado por saca/mês" />
        <InputField label="Volume anual" unit="sc" value={inputs.volumeAnnual} onChange={(v) => updateInput('volumeAnnual', v)} step="500" required hint="Produção anual total em sacas" />
        <InputField label="Prazo médio" unit="meses" value={inputs.avgMonths} onChange={(v) => updateInput('avgMonths', v)} hint="Tempo médio que o grão fica armazenado" />
      </div>

      <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Silo Próprio</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="Capacidade do silo" unit="sc" value={inputs.siloCapacity} onChange={(v) => updateInput('siloCapacity', v)} step="1000" hint="Capacidade total do silo em sacas" />
        <InputField label="Custo de construção" prefix="R$" mask="currency" unit="R$" value={inputs.constructionCost} onChange={(v) => updateInput('constructionCost', v)} step="10000" required hint="Investimento total na construção do silo" />
        <InputField label="Vida útil" unit="anos" value={inputs.siloLifeYears} onChange={(v) => updateInput('siloLifeYears', v)} hint="Silos metálicos: 20-25 anos; concreto: 30-40 anos" />
        <InputField label="Custo operacional anual" prefix="R$" mask="currency" unit="R$/ano" value={inputs.annualOpCost} onChange={(v) => updateInput('annualOpCost', v)} step="1000" hint="Energia, mão de obra, manutenção e fumigação" />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.volumeAnnual || !inputs.constructionCost} />
    </CalculatorLayout>
  )
}
