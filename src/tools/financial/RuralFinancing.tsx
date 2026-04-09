import { useMemo } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatCurrency } from '../../utils/formatters'
import { exportToCsv } from '../../utils/export-csv'
import { calculateRuralFinancing, validateRuralFinancing, type RuralFinancingResult } from '../../core/financial/rural-financing'

// ── Types ──

interface Inputs {
  creditLine: string
  amount: string
  totalMonths: string
  graceMonths: string
  annualRate: string
  system: string
}

const CREDIT_LINES = [
  { value: 'pronaf', label: 'Pronaf Custeio (4–6% a.a.)' },
  { value: 'pronamp', label: 'Pronamp Custeio (7% a.a.)' },
  { value: 'common', label: 'Custeio Comum (TLP/LCA)' },
  { value: 'moderfrota', label: 'Moderfrota (7,5% a.a.)' },
  { value: 'abc', label: 'ABC Ambiental (7% a.a.)' },
  { value: 'free', label: 'Investimento Livre' },
]

const LINE_DEFAULTS: Record<string, { rate: string; months: string; grace: string }> = {
  pronaf: { rate: '5', months: '24', grace: '6' },
  pronamp: { rate: '7', months: '36', grace: '12' },
  common: { rate: '10', months: '12', grace: '0' },
  moderfrota: { rate: '7.5', months: '60', grace: '12' },
  abc: { rate: '7', months: '96', grace: '12' },
  free: { rate: '12', months: '60', grace: '0' },
}

const SYSTEM_OPTIONS = [
  { value: 'sac', label: 'SAC (parcelas decrescentes)' },
  { value: 'price', label: 'PRICE (parcelas fixas)' },
]

const INITIAL: Inputs = {
  creditLine: 'moderfrota',
  amount: '500000',
  totalMonths: '60',
  graceMonths: '12',
  annualRate: '7.5',
  system: 'sac',
}

// ── Calculation ──

function calculate(inputs: Inputs): RuralFinancingResult | null {
  return calculateRuralFinancing({
    amount: parseFloat(inputs.amount) || 0,
    totalMonths: parseInt(inputs.totalMonths) || 0,
    graceMonths: parseInt(inputs.graceMonths) || 0,
    annualRatePercent: parseFloat(inputs.annualRate) || 0,
    system: inputs.system as 'sac' | 'price',
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.amount || isNaN(parseFloat(inputs.amount))) return 'Informe o valor financiado'
  return validateRuralFinancing({
    amount: parseFloat(inputs.amount) || 0,
    totalMonths: parseInt(inputs.totalMonths) || 0,
    graceMonths: parseInt(inputs.graceMonths) || 0,
    annualRatePercent: parseFloat(inputs.annualRate) || 0,
    system: inputs.system as 'sac' | 'price',
  })
}

// ── Component ──

export default function RuralFinancing() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, RuralFinancingResult>({ initialInputs: INITIAL, calculate, validate })

  const handleLineChange = (value: string) => {
    updateInput('creditLine', value)
    const defaults = LINE_DEFAULTS[value]
    if (defaults) {
      updateInput('annualRate', defaults.rate)
      updateInput('totalMonths', defaults.months)
      updateInput('graceMonths', defaults.grace)
    }
  }

  // Only show first 6 and last 3 installments in summary
  const tableRows = useMemo(() => {
    if (!result) return []
    const inst = result.installments
    if (inst.length <= 12) return inst.map((r) => ({ ...r, _ellipsis: false }))
    const rows = [
      ...inst.slice(0, 6).map((r) => ({ ...r, _ellipsis: false })),
      { month: 0, payment: 0, principal: 0, interest: 0, balance: 0, _ellipsis: true },
      ...inst.slice(-3).map((r) => ({ ...r, _ellipsis: false })),
    ]
    return rows
  }, [result])

  const handleExportCsv = () => {
    if (!result) return
    exportToCsv(
      ['Mês', 'Parcela (R$)', 'Amortização (R$)', 'Juros (R$)', 'Saldo (R$)'],
      result.installments.map((i) => [
        i.month,
        i.payment.toFixed(2),
        i.principal.toFixed(2),
        i.interest.toFixed(2),
        i.balance.toFixed(2),
      ]),
      `amortizacao-${inputs.system}-${inputs.creditLine}.csv`,
    )
  }

  return (
    <CalculatorLayout
      title="Simulador de Financiamento Rural"
      description="Simule Pronaf, Pronamp, Moderfrota e outras linhas de crédito rural com SAC ou PRICE."
      about="Simule financiamentos rurais com as principais linhas de crédito (Pronaf, Pronamp, Moderfrota, ABC). Compare sistemas SAC e PRICE com carência e taxas subsidiadas."
      methodology="SAC: Amortização constante, juros decrescentes. PRICE: Parcela fixa (PMT = PV × i / (1 - (1+i)^-n)). Taxas e prazos conforme Manual de Crédito Rural (MCR) do Banco Central."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Primeira parcela"
                value={formatCurrency(result.firstPayment)}
                unit=""
                highlight
                variant="warning"
              />
              <ResultCard
                label="Última parcela"
                value={formatCurrency(result.lastPayment)}
                unit=""
                highlight
                variant="warning"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Total de juros pagos"
                value={formatCurrency(result.totalInterest, 0)}
                unit=""
                variant="danger"
              />
              <ResultCard
                label="Total pago (principal + juros)"
                value={formatCurrency(result.totalPaid, 0)}
                unit=""
                variant="warning"
              />
            </div>

            {/* Amortization summary table */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Tabela de amortização ({inputs.system.toUpperCase()})
                </p>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  ↓ Exportar CSV
                </button>
              </div>
              <ComparisonTable
                columns={[
                  { key: 'month' as never, label: 'Mês' },
                  { key: 'payment' as never, label: 'Parcela', format: (v) => formatCurrency(v as number) },
                  { key: 'principal' as never, label: 'Amortiz.', format: (v) => formatCurrency(v as number) },
                  { key: 'interest' as never, label: 'Juros', format: (v) => formatCurrency(v as number) },
                  { key: 'balance' as never, label: 'Saldo', format: (v) => formatCurrency(v as number, 0) },
                ]}
                rows={tableRows as unknown as Record<string, unknown>[]}
                rowKey={'month' as never}
                colSpanRow={(row) =>
                  (row as unknown as { _ellipsis: boolean })._ellipsis
                    ? <span className="text-gray-400">…</span>
                    : null
                }
              />
            </div>

            <AlertBanner
              variant="info"
              message="Taxas de juros mudam conforme o Plano Safra vigente. Os valores acima são de referência — confirme com seu banco."
            />
          </div>
        )
      }
    >
      <SelectField
        label="Linha de crédito"
        options={CREDIT_LINES}
        value={inputs.creditLine}
        onChange={handleLineChange}
      />

      <InputField
        label="Valor financiado"
        prefix="R$" mask="currency" unit="R$"
        value={inputs.amount}
        onChange={(v) => updateInput('amount', v)}
        placeholder="ex: 500000"
        step="1000"
        required
        hint="Principal do financiamento (sem juros)"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Prazo total"
          unit="meses"
          value={inputs.totalMonths}
          onChange={(v) => updateInput('totalMonths', v)}
          placeholder="ex: 60"
          required
          hint="Prazo total incluindo carência"
        />
        <InputField
          label="Carência"
          unit="meses"
          value={inputs.graceMonths}
          onChange={(v) => updateInput('graceMonths', v)}
          placeholder="ex: 12"
          hint="Período sem amortização (paga apenas juros)"
        />
        <InputField
          label="Taxa de juros"
          unit="% a.a."
          value={inputs.annualRate}
          onChange={(v) => updateInput('annualRate', v)}
          placeholder="ex: 7.5"
          step="0.1"
          required
          hint="Taxa nominal anual do contrato"
        />
      </div>

      <SelectField
        label="Sistema de amortização"
        options={SYSTEM_OPTIONS}
        value={inputs.system}
        onChange={(v) => updateInput('system', v)}
      />

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.amount || !inputs.totalMonths || !inputs.annualRate} />
    </CalculatorLayout>
  )
}
