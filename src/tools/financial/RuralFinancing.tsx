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

// ── Types ──

interface Inputs {
  creditLine: string
  amount: string
  totalMonths: string
  graceMonths: string
  annualRate: string
  system: string
}

interface Installment {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

interface Result {
  installments: Installment[]
  firstPayment: number
  lastPayment: number
  totalInterest: number
  totalPaid: number
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

function calculate(inputs: Inputs): Result | null {
  const principal = parseFloat(inputs.amount)
  const totalMonths = parseInt(inputs.totalMonths)
  const graceMonths = parseInt(inputs.graceMonths) || 0
  const annualRate = parseFloat(inputs.annualRate)
  const monthlyRate = annualRate / 100 / 12

  const installments: Installment[] = []
  let balance = principal
  let totalInterest = 0

  if (inputs.system === 'sac') {
    const amortMonths = totalMonths - graceMonths
    const amortization = amortMonths > 0 ? principal / amortMonths : 0

    for (let m = 1; m <= totalMonths; m++) {
      const interest = balance * monthlyRate
      totalInterest += interest
      const princ = m <= graceMonths ? 0 : amortization
      const payment = interest + princ
      balance = Math.max(0, balance - princ)
      installments.push({ month: m, payment, principal: princ, interest, balance })
    }
  } else {
    // PRICE — grace period with interest-only, then fixed payments
    const amortMonths = totalMonths - graceMonths
    // Grace period
    for (let m = 1; m <= graceMonths; m++) {
      const interest = balance * monthlyRate
      totalInterest += interest
      installments.push({ month: m, payment: interest, principal: 0, interest, balance })
    }
    // Amortization period — PMT formula
    if (amortMonths > 0 && monthlyRate > 0) {
      const pmt = balance * (monthlyRate * Math.pow(1 + monthlyRate, amortMonths)) /
        (Math.pow(1 + monthlyRate, amortMonths) - 1)
      for (let m = graceMonths + 1; m <= totalMonths; m++) {
        const interest = balance * monthlyRate
        totalInterest += interest
        const princ = pmt - interest
        balance = Math.max(0, balance - princ)
        installments.push({ month: m, payment: pmt, principal: princ, interest, balance })
      }
    }
  }

  const firstPayment = installments[0]?.payment ?? 0
  const lastPayment = installments[installments.length - 1]?.payment ?? 0
  const totalPaid = installments.reduce((sum, i) => sum + i.payment, 0)

  return { installments, firstPayment, lastPayment, totalInterest, totalPaid }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.amount || parseFloat(inputs.amount) <= 0) return 'Informe o valor financiado'
  if (!inputs.totalMonths || parseInt(inputs.totalMonths) <= 0) return 'Informe o prazo total'
  if (!inputs.annualRate) return 'Informe a taxa de juros'
  const grace = parseInt(inputs.graceMonths) || 0
  const total = parseInt(inputs.totalMonths)
  if (grace >= total) return 'Carência deve ser menor que o prazo total'
  return null
}

// ── Component ──

export default function RuralFinancing() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

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
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Tabela de amortização ({inputs.system.toUpperCase()})
              </p>
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
