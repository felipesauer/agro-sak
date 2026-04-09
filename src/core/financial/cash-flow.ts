// ── Cash Flow (3-month projection) ──

export interface MonthData {
    salesRevenue: number
    financingIncome: number
    otherIncome: number
    inputsPurchase: number
    leasePay: number
    financingPay: number
    laborPay: number
    fuelMaint: number
    otherExpenses: number
}

export interface MonthResult {
    label: string
    totalIncome: number
    totalExpense: number
    balance: number
    accumulated: number
}

export interface CashFlowInput {
    initialBalance: number
    months: MonthData[]
}

export interface CashFlowResult {
    monthResults: MonthResult[]
    hasDeficit: boolean
}

export function calculateCashFlow(input: CashFlowInput): CashFlowResult {
    const { initialBalance, months } = input
    let accumulated = initialBalance
    const monthResults: MonthResult[] = []

    for (let i = 0; i < months.length; i++) {
        const m = months[i]
        const totalIncome = m.salesRevenue + m.financingIncome + m.otherIncome
        const totalExpense = m.inputsPurchase + m.leasePay + m.financingPay + m.laborPay + m.fuelMaint + m.otherExpenses
        const balance = totalIncome - totalExpense
        accumulated += balance
        monthResults.push({ label: `Mês ${i + 1}`, totalIncome, totalExpense, balance, accumulated })
    }

    const hasDeficit = monthResults.some((m) => m.accumulated < 0)

    return { monthResults, hasDeficit }
}

export function validateCashFlow(input: CashFlowInput): string | null {
    const hasAnyData = input.months.some(m =>
        Object.values(m).some(v => v > 0)
    )
    if (!hasAnyData) return 'Preencha ao menos 1 mês com dados de receita ou despesa'
    return null
}
