import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  herdSize: string
  purchaseWeight: string
  purchasePrice: string
  saleWeight: string
  salePrice: string
  finishingMonths: string
  pastureCost: string
  supplementCost: string
  healthCost: string
  otherCosts: string
  mortalityRate: string
}

interface Result {
  purchaseTotal: number
  saleTotal: number
  effectiveHeads: number
  totalOperationalCost: number
  totalCost: number
  profit: number
  margin: number
  roi: number
  arrobasProduced: number
  costPerArroba: number
  revenuePerArroba: number
}

const INITIAL: Inputs = {
  herdSize: '100',
  purchaseWeight: '12',
  purchasePrice: '310',
  saleWeight: '20',
  salePrice: '320',
  finishingMonths: '12',
  pastureCost: '80',
  supplementCost: '120',
  healthCost: '150',
  otherCosts: '50',
  mortalityRate: '2',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const heads = parseFloat(inputs.herdSize)
  const purchaseW = parseFloat(inputs.purchaseWeight)
  const purchaseP = parseFloat(inputs.purchasePrice)
  const saleW = parseFloat(inputs.saleWeight)
  const saleP = parseFloat(inputs.salePrice)
  const months = parseFloat(inputs.finishingMonths)
  const pasture = parseFloat(inputs.pastureCost)
  const supplement = parseFloat(inputs.supplementCost)
  const health = parseFloat(inputs.healthCost)
  const other = parseFloat(inputs.otherCosts)
  const mortality = parseFloat(inputs.mortalityRate) || 0

  // Purchase total
  const purchaseTotal = heads * purchaseW * purchaseP

  // Effective heads after mortality
  const effectiveHeads = heads * (1 - mortality / 100)

  // Operational costs
  const pastureTotalCost = heads * pasture * months
  const supplementTotalCost = heads * supplement * months
  const healthTotalCost = heads * health
  const otherTotalCost = heads * other
  const totalOperationalCost = pastureTotalCost + supplementTotalCost + healthTotalCost + otherTotalCost

  // Sale revenue (only effective heads)
  const saleTotal = effectiveHeads * saleW * saleP

  const totalCost = purchaseTotal + totalOperationalCost
  const profit = saleTotal - totalCost
  const margin = saleTotal > 0 ? (profit / saleTotal) * 100 : 0
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0

  // Arrobas produced (gain per head * effective heads)
  const arrobasProduced = effectiveHeads * (saleW - purchaseW)
  const costPerArroba = arrobasProduced > 0 ? totalCost / arrobasProduced : 0
  const revenuePerArroba = arrobasProduced > 0 ? saleTotal / arrobasProduced : 0

  return {
    purchaseTotal,
    saleTotal,
    effectiveHeads,
    totalOperationalCost,
    totalCost,
    profit,
    margin,
    roi,
    arrobasProduced,
    costPerArroba,
    revenuePerArroba,
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.herdSize || parseFloat(inputs.herdSize) <= 0) return 'Informe o tamanho do lote'
  if (!inputs.purchaseWeight || parseFloat(inputs.purchaseWeight) <= 0) return 'Informe o peso de compra'
  if (!inputs.purchasePrice || parseFloat(inputs.purchasePrice) <= 0) return 'Informe o preço de compra'
  if (!inputs.saleWeight || parseFloat(inputs.saleWeight) <= 0) return 'Informe o peso de venda'
  if (!inputs.salePrice || parseFloat(inputs.salePrice) <= 0) return 'Informe o preço de venda'
  if (!inputs.finishingMonths || parseFloat(inputs.finishingMonths) <= 0) return 'Informe o tempo de engorda'
  if (parseFloat(inputs.saleWeight) <= parseFloat(inputs.purchaseWeight))
    return 'Peso de venda deve ser maior que o de compra'
  return null
}

// ── Component ──

export default function LivestockProfitability() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Rentabilidade de Pecuária"
      description="Calcule o lucro, margem e ROI da engorda de gado bovino."
      about="Simule a compra, engorda e venda de bovinos. Considere todos os custos (compra, pasto, suplemento, sanidade) e descubra o lucro líquido, margem e retorno do investimento por arroba produzida."
      methodology="Receita = Cabeças efetivas × Peso venda × Preço/@. Custo = Compra + Pasto + Suplemento + Sanidade + Outros. Margem = Lucro / Receita. ROI = Lucro / Custo total. Cabeças efetivas = Lote × (1 − Mortalidade%)."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Custo total de compra"
                value={formatCurrency(result.purchaseTotal)}
                unit=""
              />
              <ResultCard
                label="Custos operacionais"
                value={formatCurrency(result.totalOperationalCost)}
                unit=""
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Custo total"
                value={formatCurrency(result.totalCost)}
                unit=""
                variant="warning"
              />
              <ResultCard
                label="Receita de venda"
                value={formatCurrency(result.saleTotal)}
                unit=""
                variant="success"
              >
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(result.effectiveHeads, 0)} cabeças efetivas
                </p>
              </ResultCard>
            </div>

            <ResultCard
              label="Lucro líquido"
              value={formatCurrency(result.profit)}
              unit=""
              highlight
              variant={result.profit > 0 ? 'success' : 'danger'}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Margem"
                value={formatPercent(result.margin)}
                unit=""
                variant={result.margin > 15 ? 'success' : result.margin > 0 ? 'warning' : 'danger'}
              />
              <ResultCard
                label="ROI"
                value={formatPercent(result.roi)}
                unit=""
                variant={result.roi > 20 ? 'success' : result.roi > 0 ? 'warning' : 'danger'}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Arrobas produzidas"
                value={formatNumber(result.arrobasProduced, 0)}
                unit="@"
              />
              <ResultCard
                label="Custo por @ produzida"
                value={formatCurrency(result.costPerArroba)}
                unit="/@"
              />
            </div>

            <AlertBanner
              variant={result.profit > 0 ? 'success' : 'error'}
              message={
                result.profit > 0
                  ? `Lucro de ${formatCurrency(result.profit)} em ${inputs.finishingMonths} meses. ROI de ${formatPercent(result.roi)}.`
                  : 'A operação resulta em prejuízo. Reavalie custos ou preço de venda.'
              }
            />
          </div>
        )
      }
    >
      <InputField
        label="Tamanho do lote"
        unit="cabeças"
        value={inputs.herdSize}
        onChange={(v) => updateInput('herdSize', v)}
        placeholder="ex: 100"
        hint="Número de animais no lote"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Peso de compra"
          unit="@"
          value={inputs.purchaseWeight}
          onChange={(v) => updateInput('purchaseWeight', v)}
          placeholder="ex: 12"
          hint="Peso em arrobas na entrada"
        />
        <InputField
          label="Preço de compra"
          prefix="R$" mask="currency" unit="R$/@"
          value={inputs.purchasePrice}
          onChange={(v) => updateInput('purchasePrice', v)}
          placeholder="ex: 310"
          hint="Preço pago por arroba na compra"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Peso de venda"
          unit="@"
          value={inputs.saleWeight}
          onChange={(v) => updateInput('saleWeight', v)}
          placeholder="ex: 20"
          hint="Peso em arrobas na saída"
        />
        <InputField
          label="Preço de venda"
          prefix="R$" mask="currency" unit="R$/@"
          value={inputs.salePrice}
          onChange={(v) => updateInput('salePrice', v)}
          placeholder="ex: 320"
          hint="Preço esperado por arroba na venda"
        />
      </div>

      <InputField
        label="Tempo de engorda"
        unit="meses"
        value={inputs.finishingMonths}
        onChange={(v) => updateInput('finishingMonths', v)}
        placeholder="ex: 12"
        hint="Período de engorda em meses"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Custo de pasto"
          prefix="R$" mask="currency" unit="R$/cab/mês"
          value={inputs.pastureCost}
          onChange={(v) => updateInput('pastureCost', v)}
          placeholder="ex: 80"
          hint="Custo mensal de pastagem por cabeça"
        />
        <InputField
          label="Suplemento / ração"
          prefix="R$" mask="currency" unit="R$/cab/mês"
          value={inputs.supplementCost}
          onChange={(v) => updateInput('supplementCost', v)}
          placeholder="ex: 120"
          hint="Custo mensal de suplementação por cabeça"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Sanidade / vacinas"
          prefix="R$" mask="currency" unit="R$/cab"
          value={inputs.healthCost}
          onChange={(v) => updateInput('healthCost', v)}
          placeholder="ex: 150"
          hint="Custo total com sanidade por cabeça no período"
        />
        <InputField
          label="Outros custos"
          prefix="R$" mask="currency" unit="R$/cab"
          value={inputs.otherCosts}
          onChange={(v) => updateInput('otherCosts', v)}
          placeholder="ex: 50"
          hint="Frete, comissão, outros custos por cabeça"
        />
      </div>

      <InputField
        label="Taxa de mortalidade"
        unit="%"
        value={inputs.mortalityRate}
        onChange={(v) => updateInput('mortalityRate', v)}
        placeholder="ex: 2"
        max="100"
        min="0"
        hint="Percentual esperado de perda do lote (0-100%)"
      />

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.herdSize} />
    </CalculatorLayout>
  )
}
