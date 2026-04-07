import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'

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

interface Result {
  immediateRevenue: number
  storageCost: number
  capitalCost: number
  insuranceCost: number
  totalCost: number
  breakageSc: number
  futureRevenue: number
  netGain: number
  recommendation: string
  breakEvenPrice: number
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

function calculate(inputs: Inputs): Result | null {
  const qty = parseFloat(inputs.quantity)
  const curPrice = parseFloat(inputs.currentPrice)
  const futPrice = parseFloat(inputs.futurePrice)
  const months = parseFloat(inputs.storageMonths)
  const fee = parseFloat(inputs.storageFee)
  const breakPct = parseFloat(inputs.breakageRate) / 100
  const capPct = parseFloat(inputs.capitalRate) / 100
  const insPct = parseFloat(inputs.insuranceRate) / 100

  const immediateRevenue = qty * curPrice
  const storageCost = qty * fee * months
  const breakageSc = qty * breakPct * months
  const capitalCost = immediateRevenue * capPct * months
  const insuranceCost = immediateRevenue * insPct * months
  const totalCost = storageCost + capitalCost + insuranceCost
  const netQty = qty - breakageSc
  const futureRevenue = netQty * futPrice - totalCost
  const netGain = futureRevenue - immediateRevenue

  const recommendation = netGain > 0 ? 'Vale armazenar — ganho projetado positivo' : 'Melhor vender agora — custo de armazenagem supera o ganho'

  // Break-even price: future price where netGain = 0
  // immediateRevenue = (qty - breakage) * breakEvenPrice - totalCost
  const breakEvenPrice = netQty > 0 ? (immediateRevenue + totalCost) / netQty : 0

  return {
    immediateRevenue,
    storageCost,
    capitalCost,
    insuranceCost,
    totalCost,
    breakageSc,
    futureRevenue,
    netGain,
    recommendation,
    breakEvenPrice,
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.quantity || parseFloat(inputs.quantity) <= 0) return 'Informe a quantidade'
  if (!inputs.currentPrice || parseFloat(inputs.currentPrice) <= 0) return 'Informe o preço atual'
  if (!inputs.futurePrice) return 'Informe o preço futuro esperado'
  if (!inputs.storageMonths || parseFloat(inputs.storageMonths) <= 0) return 'Informe o prazo de armazenagem'
  return null
}

// ── Component ──

export default function StorageViability() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

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
