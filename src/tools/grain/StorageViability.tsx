import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { calculateStorageViability, validateStorageViability, type StorageViabilityResult } from '../../core/grain/storage-viability'

// ── Types ──

interface Inputs {
  quantity: string
  currentPrice: string
  futurePrice: string
  storageMonths: string
  storageFee: string
  breakageRate: string
  capitalRate: string
  insuranceRate: string
}

const INITIAL: Inputs = {
  quantity: '10000',
  currentPrice: '105',
  futurePrice: '120',
  storageMonths: '4',
  storageFee: '0.45',
  breakageRate: '0.1',
  capitalRate: '1',
  insuranceRate: '0.05',
}

// ── Calculation ──

function calculate(inputs: Inputs): StorageViabilityResult | null {
  return calculateStorageViability({
    quantitySc: parseFloat(inputs.quantity),
    currentPricePerSc: parseFloat(inputs.currentPrice),
    futurePricePerSc: parseFloat(inputs.futurePrice),
    storageMonths: parseFloat(inputs.storageMonths),
    storageFeePerScMonth: parseFloat(inputs.storageFee),
    breakageRatePctMonth: parseFloat(inputs.breakageRate),
    capitalRatePctMonth: parseFloat(inputs.capitalRate),
    insuranceRatePctMonth: parseFloat(inputs.insuranceRate),
  })
}

function validate(inputs: Inputs): string | null {
  return validateStorageViability({
    quantitySc: parseFloat(inputs.quantity),
    currentPricePerSc: parseFloat(inputs.currentPrice),
    futurePricePerSc: parseFloat(inputs.futurePrice),
    storageMonths: parseFloat(inputs.storageMonths),
  })
}

// ── Component ──

export default function StorageViability() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, StorageViabilityResult>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Viabilidade de Armazenagem"
      description="Vale vender agora ou guardar e vender mais caro? Simule o resultado com todos os custos."
      about="Decida entre vender o grão agora ou armazenar para vender mais tarde. Compare o ganho esperado com valorização contra os custos de armazenagem, quebra técnica e custo de oportunidade."
      methodology="Ganho com espera = (Preço futuro - Preço atual) × Volume. Custo de espera = Armazenagem + Quebra técnica + Custo capital + Seguro. Viável se Ganho > Custo."
      result={
        result && (
          <div className="space-y-4">
            <div className={`rounded-lg border p-4 ${result.netGain >= 0 ? 'bg-agro-50 border-agro-300' : 'bg-red-50 border-red-300'}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {result.netGain >= 0 ? 'Ganho com armazenagem' : 'Perda com armazenagem'}
              </p>
              <p className={`text-3xl font-bold mt-1 ${result.netGain >= 0 ? 'text-agro-800' : 'text-red-700'}`}>
                {formatCurrency(result.netGain, 0)}
              </p>
            </div>

            <AlertBanner
              variant={result.netGain >= 0 ? 'success' : 'warning'}
              message={result.recommendation}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard label="Receita venda imediata" value={formatCurrency(result.immediateRevenue, 0)} unit="" variant="warning" />
              <ResultCard label="Receita venda futura líq." value={formatCurrency(result.futureRevenue, 0)} unit="" variant={result.netGain >= 0 ? 'success' : 'danger'} />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Custos da armazenagem</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Armazenagem</span><span>{formatCurrency(result.storageCost, 0)}</span></div>
                <div className="flex justify-between"><span>Custo de capital</span><span>{formatCurrency(result.capitalCost, 0)}</span></div>
                <div className="flex justify-between"><span>Seguro</span><span>{formatCurrency(result.insuranceCost, 0)}</span></div>
                <div className="flex justify-between"><span>Quebra técnica</span><span>{formatNumber(result.breakageSc, 1)} sc</span></div>
                <div className="flex justify-between font-bold border-t border-gray-300 pt-1 mt-1">
                  <span>Total</span><span>{formatCurrency(result.totalCost, 0)}</span>
                </div>
              </div>
            </div>

            <ResultCard label="Preço futuro mínimo (break-even)" value={formatCurrency(result.breakEvenPrice)} unit="/sc" variant="warning">
              <p className="text-xs text-gray-500 mt-1">
                Abaixo deste preço, não compensa armazenar
              </p>
            </ResultCard>
          </div>
        )
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="Quantidade" unit="sc" value={inputs.quantity} onChange={(v) => updateInput('quantity', v)} step="100" required hint="Volume de grãos a armazenar" />
        <InputField label="Preço atual (colheita)" prefix="R$" mask="currency" unit="R$/sc" value={inputs.currentPrice} onChange={(v) => updateInput('currentPrice', v)} step="0.50" required hint="Preço de venda disponível hoje" />
        <InputField label="Preço futuro esperado" prefix="R$" mask="currency" unit="R$/sc" value={inputs.futurePrice} onChange={(v) => updateInput('futurePrice', v)} step="0.50" required hint="Preço esperado após o período de armazenagem" />
        <InputField label="Prazo de armazenagem" unit="meses" value={inputs.storageMonths} onChange={(v) => updateInput('storageMonths', v)} required hint="Período que pretende guardar o grão" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mt-3">
        <InputField label="Taxa de armazenagem" prefix="R$" mask="currency" unit="R$/sc/mês" value={inputs.storageFee} onChange={(v) => updateInput('storageFee', v)} step="0.05" hint="Custo cobrado pelo armazém por saca/mês" />
        <InputField label="Quebra técnica" unit="% ao mês" value={inputs.breakageRate} onChange={(v) => updateInput('breakageRate', v)} step="0.05" hint="Perda física esperada (geralmente 0,1-0,3%/mês)" />
        <InputField label="Custo de capital" unit="% ao mês" value={inputs.capitalRate} onChange={(v) => updateInput('capitalRate', v)} step="0.1" hint="Custo de oportunidade do dinheiro parado (Selic/CDI)" />
        <InputField label="Custo de seguro" unit="% do valor/mês" value={inputs.insuranceRate} onChange={(v) => updateInput('insuranceRate', v)} step="0.01" hint="Seguro do grão armazenado" />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.quantity || !inputs.currentPrice || !inputs.futurePrice} />
    </CalculatorLayout>
  )
}
