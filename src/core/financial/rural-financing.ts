// ── Rural Financing (SAC & PRICE) ──

export interface RuralFinancingInput {
    amount: number
    totalMonths: number
    graceMonths: number
    annualRatePercent: number
    system: 'sac' | 'price'
}

export interface Installment {
    month: number
    payment: number
    principal: number
    interest: number
    balance: number
}

export interface RuralFinancingResult {
    installments: Installment[]
    firstPayment: number
    lastPayment: number
    totalInterest: number
    totalPaid: number
}

export function calculateRuralFinancing(input: RuralFinancingInput): RuralFinancingResult {
    const { amount, totalMonths, graceMonths, annualRatePercent, system } = input
    const monthlyRate = annualRatePercent / 100 / 12

    const installments: Installment[] = []
    let balance = amount
    let totalInterest = 0

    if (system === 'sac') {
        const amortMonths = totalMonths - graceMonths
        const amortization = amortMonths > 0 ? amount / amortMonths : 0

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

export function validateRuralFinancing(input: RuralFinancingInput): string | null {
    if (!input.amount || input.amount <= 0) return 'Informe o valor financiado'
    if (!input.totalMonths || input.totalMonths <= 0) return 'Informe o prazo total'
    if (input.annualRatePercent === undefined || input.annualRatePercent === null) return 'Informe a taxa de juros'
    if (input.graceMonths >= input.totalMonths) return 'Carência deve ser menor que o prazo total'
    return null
}
