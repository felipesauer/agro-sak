import { useState, useEffect, useCallback } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { STATE_OPTIONS } from '../../data/reference-data'
import { fetchCbsRates, type CbsRates } from '../../utils/cbs-api'

// ── Types ──

interface Inputs {
  producerType: string
  state: string
  annualRevenue: string
  domesticPercent: string
  exportPercent: string
  inputCost: string
}

interface Result {
  currentFunrural: number
  currentTotal: number
  newCBS: number
  newIBS: number
  newGrossTotal: number
  newCredits: number
  newNetTotal: number
  difference: number
  differencePercent: number
}

const INITIAL: Inputs = {
  producerType: 'pf',
  state: 'MT',
  annualRevenue: '',
  domesticPercent: '70',
  exportPercent: '30',
  inputCost: '',
}

const PRODUCER_OPTIONS = [
  { value: 'pf', label: 'Pessoa Física (LCDPR)' },
  { value: 'pj', label: 'Pessoa Jurídica (Lucro Presumido)' },
  { value: 'coop', label: 'Cooperativa' },
]

const YEAR_OPTIONS = [
  { value: '2026-01-01', label: '2026 (início transição)' },
  { value: '2027-01-01', label: '2027' },
  { value: '2028-01-01', label: '2028' },
  { value: '2029-01-01', label: '2029' },
  { value: '2030-01-01', label: '2030' },
  { value: '2031-01-01', label: '2031' },
  { value: '2032-01-01', label: '2032' },
  { value: '2033-01-01', label: '2033 (implementação plena)' },
]

// ── Calculation ──

function calculate(inputs: Inputs, rates: CbsRates): Result | null {
  const revenue = parseFloat(inputs.annualRevenue)
  if (isNaN(revenue) || revenue <= 0) return null
  const domestic = parseFloat(inputs.domesticPercent) / 100
  const inputCost = parseFloat(inputs.inputCost) || 0

  // Current regime
  const funruralRate = inputs.producerType === 'pj' ? 0.0285 : 0.015
  const domesticRevenue = revenue * domestic
  const currentFunrural = domesticRevenue * funruralRate
  const currentTotal = currentFunrural

  // New regime (IBS + CBS) — rates from API or fallback
  const agroDiscount = 0.4 // 60% reduction → pays 40%
  const cbsEffective = (rates.cbsRate / 100) * agroDiscount
  const ibsEffective = (rates.ibsRate / 100) * agroDiscount
  const totalEffective = cbsEffective + ibsEffective

  const newCBS = domesticRevenue * cbsEffective
  const newIBS = domesticRevenue * ibsEffective
  const newGrossTotal = newCBS + newIBS

  // Credits on inputs
  const newCredits = inputCost * totalEffective
  const newNetTotal = Math.max(0, newGrossTotal - newCredits)

  const difference = newNetTotal - currentTotal
  const differencePercent = currentTotal > 0 ? (difference / currentTotal) * 100 : 0

  return {
    currentFunrural,
    currentTotal,
    newCBS,
    newIBS,
    newGrossTotal,
    newCredits,
    newNetTotal,
    difference,
    differencePercent,
  }
}

// ── Component ──

export default function TaxReform() {
  const [rates, setRates] = useState<CbsRates | null>(null)
  const [loadingRates, setLoadingRates] = useState(true)
  const [rateYear, setRateYear] = useState('2033-01-01')

  const validateWithRates = useCallback(
    (inputs: Inputs): string | null => {
      if (!inputs.annualRevenue) return 'Informe o faturamento anual'
      const dom = parseFloat(inputs.domesticPercent) || 0
      const exp = parseFloat(inputs.exportPercent) || 0
      if (Math.abs(dom + exp - 100) > 1) return 'Mercado interno + exportação deve somar 100%'
      if (!rates) return 'Aguardando taxas da API...'
      return null
    },
    [rates],
  )

  const calculateWithRates = useCallback(
    (inputs: Inputs) => (rates ? calculate(inputs, rates) : null),
    [rates],
  )

  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate: calculateWithRates, validate: validateWithRates })

  const handleRateYearChange = useCallback((value: string) => {
    setRateYear(value)
    setLoadingRates(true)
  }, [])

  const handleStateChange = useCallback((value: string) => {
    updateInput('state', value as never)
    setLoadingRates(true)
  }, [updateInput])

  // Fetch CBS/IBS rates when state or year changes
  useEffect(() => {
    let cancelled = false
    fetchCbsRates(inputs.state, rateYear).then(r => {
      if (!cancelled) {
        setRates(r)
        setLoadingRates(false)
      }
    })
    return () => { cancelled = true }
  }, [inputs.state, rateYear])

  return (
    <CalculatorLayout
      title="Reforma Tributária Rural"
      description="Simule o impacto da EC 132/2023 na carga tributária do produtor rural: regime atual vs novo (CBS + IBS)."
      about="Simule o impacto da Reforma Tributária (EC 132/2023) no produtor rural. Compare a carga atual (PIS/COFINS/ICMS) com o novo IVA Dual (CBS + IBS) e o regime diferenciado para o agro."
      methodology="CBS (federal): 8,8% padrão. IBS (estadual/municipal): 17,7% padrão. Insumos agropecuários: redução de 60% na alíquota (alíquota efetiva ≈ 10,6%). Transição: 2026-2032."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Carga tributária atual"
                value={formatCurrency(result.currentTotal)}
                prefix="R$" mask="currency" unit="R$/ano"
                variant="warning"
              />
              <ResultCard
                label="Carga tributária nova (líquida)"
                value={formatCurrency(result.newNetTotal)}
                prefix="R$" mask="currency" unit="R$/ano"
                highlight
                variant="warning"
              />
            </div>

            <ResultCard
              label={result.difference > 0 ? 'Aumento estimado' : 'Redução estimada'}
              value={formatCurrency(Math.abs(result.difference))}
              unit={`${result.difference > 0 ? '+' : '-'}${formatNumber(Math.abs(result.differencePercent), 1)}%`}
              highlight
              variant={result.difference > 0 ? 'danger' : 'success'}
            />

            <div className="text-sm space-y-1">
              <p><strong>Detalhamento novo regime:</strong></p>
              <p>CBS (federal): {formatCurrency(result.newCBS)}</p>
              <p>IBS (subnacional): {formatCurrency(result.newIBS)}</p>
              <p>Créditos aproveitáveis: -{formatCurrency(result.newCredits)}</p>
            </div>

            <AlertBanner
              variant="warning"
              message="Estimativa baseada em legislação vigente. Reforma em fase de transição até 2033. Consulte seu contador para análise detalhada."
            />
          </div>
        )
      }
    >
      {!rates && loadingRates && (
        <div className="text-xs px-3 py-2 rounded-lg mb-2 bg-gray-50 text-gray-500 animate-pulse">
          Carregando alíquotas CBS/IBS...
        </div>
      )}
      {rates && (
        <div className={`text-xs px-3 py-2 rounded-lg mb-2 ${rates.source === 'api' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
          {rates.source === 'api' ? 'Alíquotas do CBS Piloto (API oficial)' : 'Usando alíquotas de referência (API indisponível)'}
          {' — '}CBS: {formatNumber(rates.cbsRate, 2)}% | IBS: {formatNumber(rates.ibsRate, 2)}%
          {loadingRates && ' (atualizando...)'}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Tipo de produtor"
          options={PRODUCER_OPTIONS}
          value={inputs.producerType}
          onChange={(v) => updateInput('producerType', v)}
        />
        <SelectField
          label="Ano de referência"
          options={YEAR_OPTIONS}
          value={rateYear}
          onChange={handleRateYearChange}
        />
      </div>

      <SelectField
        label="Estado"
        options={STATE_OPTIONS}
        value={inputs.state}
        onChange={handleStateChange}
      />

      <InputField
        label="Faturamento anual bruto"
        prefix="R$" mask="currency" unit="R$"
        value={inputs.annualRevenue}
        onChange={(v) => updateInput('annualRevenue', v)}
        placeholder="ex: 5000000"
        min="0"
        required
        hint="Receita total da atividade rural no ano"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Mercado interno"
          unit="%"
          value={inputs.domesticPercent}
          onChange={(v) => {
            updateInput('domesticPercent', v)
            const val = parseFloat(v) || 0
            updateInput('exportPercent', String(100 - val))
          }}
          placeholder="ex: 70"
          min="0"
          max="100"
          hint="Percentual vendido no mercado nacional"
        />
        <InputField
          label="Exportação"
          unit="%"
          value={inputs.exportPercent}
          onChange={(v) => {
            updateInput('exportPercent', v)
            const val = parseFloat(v) || 0
            updateInput('domesticPercent', String(100 - val))
          }}
          placeholder="ex: 30"
          min="0"
          max="100"
          hint="Percentual vendido para exportação"
        />
      </div>

      <InputField
        label="Compra de insumos anual (para calcular créditos)"
        prefix="R$" mask="currency" unit="R$"
        value={inputs.inputCost}
        onChange={(v) => updateInput('inputCost', v)}
        placeholder="ex: 2200000"
        hint="Insumos, máquinas e serviços com direito a crédito"
        min="0"
      />

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.annualRevenue} />
    </CalculatorLayout>
  )
}
