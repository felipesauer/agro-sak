import { useState } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency } from '../../utils/formatters'

// ── Types ──

const MONTHS = ['Mês 1', 'Mês 2', 'Mês 3'] as const

interface MonthData {
  salesRevenue: string
  financingIncome: string
  otherIncome: string
  inputsPurchase: string
  leasePay: string
  financingPay: string
  laborPay: string
  fuelMaint: string
  otherExpenses: string
}

interface Inputs {
  months: [MonthData, MonthData, MonthData]
  initialBalance: string
}

interface MonthResult {
  label: string
  totalIncome: number
  totalExpense: number
  balance: number
  accumulated: number
}

interface Result {
  monthResults: MonthResult[]
  hasDeficit: boolean
}

function emptyMonth(): MonthData {
  return {
    salesRevenue: '',
    financingIncome: '',
    otherIncome: '',
    inputsPurchase: '',
    leasePay: '',
    financingPay: '',
    laborPay: '',
    fuelMaint: '',
    otherExpenses: '',
  }
}

const INITIAL: Inputs = {
  months: [emptyMonth(), emptyMonth(), emptyMonth()],
  initialBalance: '0',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const initial = parseFloat(inputs.initialBalance) || 0
  let accumulated = initial
  const monthResults: MonthResult[] = []

  for (let i = 0; i < 3; i++) {
    const m = inputs.months[i]
    const totalIncome =
      (parseFloat(m.salesRevenue) || 0) +
      (parseFloat(m.financingIncome) || 0) +
      (parseFloat(m.otherIncome) || 0)
    const totalExpense =
      (parseFloat(m.inputsPurchase) || 0) +
      (parseFloat(m.leasePay) || 0) +
      (parseFloat(m.financingPay) || 0) +
      (parseFloat(m.laborPay) || 0) +
      (parseFloat(m.fuelMaint) || 0) +
      (parseFloat(m.otherExpenses) || 0)
    const balance = totalIncome - totalExpense
    accumulated += balance
    monthResults.push({ label: MONTHS[i], totalIncome, totalExpense, balance, accumulated })
  }

  const hasDeficit = monthResults.some((m) => m.accumulated < 0)

  return { monthResults, hasDeficit }
}

// ── Component ──

export default function CashFlow() {
  const [activeMonth, setActiveMonth] = useState(0)
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate })

  const updateMonth = (monthIdx: number, field: keyof MonthData, value: string) => {
    const newMonths = [...inputs.months] as [MonthData, MonthData, MonthData]
    newMonths[monthIdx] = { ...newMonths[monthIdx], [field]: value }
    updateInput('months', newMonths as never)
  }

  const incomeFields: { key: keyof MonthData; label: string; hint?: string }[] = [
    { key: 'salesRevenue', label: 'Venda de grãos', hint: 'Receita com comercialização da produção' },
    { key: 'financingIncome', label: 'Recebimento de financiamento', hint: 'Liberação de crédito rural ou custeio' },
    { key: 'otherIncome', label: 'Outras receitas', hint: 'Arrendamento recebido, serviços, etc.' },
  ]

  const expenseFields: { key: keyof MonthData; label: string; hint?: string }[] = [
    { key: 'inputsPurchase', label: 'Compra de insumos', hint: 'Sementes, fertilizantes e defensivos' },
    { key: 'leasePay', label: 'Arrendamento', hint: 'Pagamento mensal ao proprietário da terra' },
    { key: 'financingPay', label: 'Parcelas de financiamento', hint: 'Amortização e juros de crédito rural' },
    { key: 'laborPay', label: 'Mão de obra', hint: 'Salários, encargos e diaristas' },
    { key: 'fuelMaint', label: 'Combustível e manutenção', hint: 'Diesel, peças e manutenção de máquinas' },
    { key: 'otherExpenses', label: 'Outras saídas', hint: 'Impostos, seguros e despesas administrativas' },
  ]

  return (
    <CalculatorLayout
      title="Fluxo de Caixa Rural"
      description="Projeção simplificada de entradas e saídas para os próximos 3 meses."
      about="Projete o fluxo de caixa da fazenda para os próximos 3 meses. Visualize quando o saldo ficará negativo e planeje antecipadamente a necessidade de capital de giro."
      methodology="Saldo mensal = Saldo anterior + Receitas - Despesas (operacionais + fixas + investimentos). Saldo acumulado progressivo."
      result={
        result && (
          <div className="space-y-4">
            {/* Monthly summary cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              {result.monthResults.map((m) => (
                <div
                  key={m.label}
                  className={`rounded-lg border p-4 ${
                    m.accumulated >= 0
                      ? 'bg-agro-50 border-agro-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    {m.label}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="text-agro-700">+ {formatCurrency(m.totalIncome, 0)}</p>
                    <p className="text-red-600">− {formatCurrency(m.totalExpense, 0)}</p>
                    <p className={`font-bold ${m.balance >= 0 ? 'text-agro-800' : 'text-red-700'}`}>
                      Saldo: {formatCurrency(m.balance, 0)}
                    </p>
                    <p className={`text-xs ${m.accumulated >= 0 ? 'text-gray-500' : 'text-red-600 font-medium'}`}>
                      Acumulado: {formatCurrency(m.accumulated, 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {result.hasDeficit && (
              <AlertBanner
                variant="error"
                message="Atenção: déficit projetado — saldo acumulado ficará negativo. Considere uma linha de crédito de giro."
              />
            )}
          </div>
        )
      }
    >
      <InputField
        label="Saldo inicial em caixa"
        prefix="R$" mask="currency" unit="R$"
        value={inputs.initialBalance}
        onChange={(v) => updateInput('initialBalance', v)}
        placeholder="ex: 50000"
        step="1000"
        hint="Saldo disponível no início do período (conta corrente + aplicações)"
      />

      {/* Month tabs */}
      <div className="flex border-b border-gray-200 mt-4">
        {MONTHS.map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveMonth(idx)}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeMonth === idx
                ? 'border-b-2 border-agro-600 text-agro-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active month fields */}
      <div className="mt-4">
        <p className="text-sm font-medium text-agro-700 mb-2">Entradas (R$)</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {incomeFields.map((f) => (
            <InputField
              key={f.key}
              label={f.label}
              prefix="R$" mask="currency" unit="R$"
              value={inputs.months[activeMonth][f.key]}
              onChange={(v) => updateMonth(activeMonth, f.key, v)}
              placeholder="0"
              step="100"
              hint={f.hint}
            />
          ))}
        </div>

        <p className="text-sm font-medium text-red-600 mb-2 mt-4">Saídas (R$)</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {expenseFields.map((f) => (
            <InputField
              key={f.key}
              label={f.label}
              prefix="R$" mask="currency" unit="R$"
              value={inputs.months[activeMonth][f.key]}
              onChange={(v) => updateMonth(activeMonth, f.key, v)}
              placeholder="0"
              step="100"
              hint={f.hint}
            />
          ))}
        </div>
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.months.some(m => Object.values(m).some(v => v !== ''))} />
    </CalculatorLayout>
  )
}
