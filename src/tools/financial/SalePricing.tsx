import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { calculateSalePricing, validateSalePricing, type SalePricingResult } from '../../core/financial/sale-pricing'

// ── Types ──

interface Inputs {
  costPerSc: string
  producerType: string
  icms: string
  desiredMargin: string
  brokerFee: string
  marketPrice: string
}

const PRODUCER_OPTIONS = [
  { value: 'pf', label: 'Pessoa Física (PF) — 1,5%' },
  { value: 'pj', label: 'Pessoa Jurídica (PJ) — 2,85%' },
]

const INITIAL: Inputs = {
  costPerSc: '68',
  producerType: 'pf',
  icms: '0',
  desiredMargin: '20',
  brokerFee: '1',
  marketPrice: '',
}

// ── Calculation ──

function calculate(inputs: Inputs): SalePricingResult | null {
  return calculateSalePricing({
    costPerSc: parseFloat(inputs.costPerSc) || 0,
    producerType: inputs.producerType,
    icmsPercent: parseFloat(inputs.icms) || 0,
    desiredMarginPercent: parseFloat(inputs.desiredMargin) || 0,
    brokerFeePercent: parseFloat(inputs.brokerFee) || 0,
    marketPrice: parseFloat(inputs.marketPrice) || undefined,
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.costPerSc || isNaN(parseFloat(inputs.costPerSc))) return 'Informe o custo de produção por saca'
  return validateSalePricing({
    costPerSc: parseFloat(inputs.costPerSc) || 0,
    producerType: inputs.producerType,
    icmsPercent: parseFloat(inputs.icms) || 0,
    desiredMarginPercent: parseFloat(inputs.desiredMargin) || 0,
    brokerFeePercent: parseFloat(inputs.brokerFee) || 0,
    marketPrice: parseFloat(inputs.marketPrice) || undefined,
  })
}

// ── Component ──

export default function SalePricing() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, SalePricingResult>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Precificação de Venda"
      description="Calcule o preço mínimo e o preço com margem de lucro considerando impostos e comissões."
      about="Calcule o preço mínimo de venda que cobre todos os custos e impostos, e defina sua margem de lucro desejada. Considere Funrural, ICMS e comissões."
      methodology="Preço mínimo = Custo por saca / (1 - Funrural% - ICMS% - Comissão%). Preço com margem = Preço mínimo / (1 - Margem desejada%)."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Preço mínimo (sem lucro)"
                value={formatCurrency(result.minPrice)}
                unit="/sc"
                highlight
                variant="warning"
              >
                <p className="text-xs text-gray-500 mt-1">
                  Apenas cobre custos + impostos ({formatPercent(result.totalTaxRate)})
                </p>
              </ResultCard>
              <ResultCard
                label="Preço com margem desejada"
                value={formatCurrency(result.priceWithMargin)}
                unit="/sc"
                highlight
                variant="success"
              />
            </div>

            <ResultCard
              label="Mark-up implícito"
              value={formatPercent(result.markup)}
              unit=""
              variant="default"
            >
              <p className="text-xs text-gray-500 mt-1">
                Diferença percentual entre preço de venda e custo
              </p>
            </ResultCard>

            {result.marketDiff !== null && (
              <AlertBanner
                variant={result.marketDiff >= 0 ? 'success' : 'error'}
                message={
                  result.marketDiff >= 0
                    ? `O preço de mercado está ${formatCurrency(result.marketDiff)}/sc ACIMA do preço com margem — viável.`
                    : `O preço de mercado está ${formatCurrency(Math.abs(result.marketDiff))}/sc ABAIXO do preço com margem — atenção.`
                }
              />
            )}
          </div>
        )
      }
    >
      <InputField
        label="Custo de produção"
        prefix="R$" mask="currency" unit="R$/sc"
        value={inputs.costPerSc}
        onChange={(v) => updateInput('costPerSc', v)}
        placeholder="ex: 68"
        step="0.01"
        required
        hint="Custo total dividido pela produtividade em sacas"
      />

      <SelectField
        label="Tipo de produtor (Funrural)"
        options={PRODUCER_OPTIONS}
        value={inputs.producerType}
        onChange={(v) => updateInput('producerType', v)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="ICMS sobre venda"
          unit="%"
          value={inputs.icms}
          onChange={(v) => updateInput('icms', v)}
          placeholder="ex: 0"
          step="0.01"
          hint="Soja isenta em vários estados"
        />
        <InputField
          label="Margem de lucro desejada"
          unit="%"
          value={inputs.desiredMargin}
          onChange={(v) => updateInput('desiredMargin', v)}
          placeholder="ex: 20"
          step="1"
          hint="Percentual de lucro que deseja obter sobre a venda"
        />
        <InputField
          label="Comissão (corretor/trading)"
          unit="%"
          value={inputs.brokerFee}
          onChange={(v) => updateInput('brokerFee', v)}
          placeholder="ex: 1"
          step="0.1"
          hint="Taxa cobrada pelo intermediário na comercialização"
        />
      </div>

      <InputField
        label="Preço atual no mercado"
        prefix="R$" mask="currency" unit="R$/sc"
        value={inputs.marketPrice}
        onChange={(v) => updateInput('marketPrice', v)}
        placeholder="ex: 120 (opcional)"
        step="0.01"
        hint="Opcional — para comparar com o preço calculado"
      />

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.costPerSc} />
    </CalculatorLayout>
  )
}
