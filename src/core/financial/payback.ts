// ── Payback Period + NPV + ROI ──

export interface PaybackInput {
    investmentValue: number
    annualNetGain: number
    usefulLifeYears: number
    residualValue: number
    discountRatePercent: number
}

export interface YearRow {
    year: number
    cashFlow: number
    cumulative: number
    discountedCF: number
    cumulativeDiscounted: number
}

export interface PaybackResult {
    simplePayback: number     // years, -1 if never
    discountedPayback: number // years, -1 if never
    totalReturn: number
    roi: number
    npv: number
    yearRows: YearRow[]
}

export function calculatePayback(input: PaybackInput): PaybackResult {
    const { investmentValue, annualNetGain, usefulLifeYears, residualValue, discountRatePercent } = input
    const rate = discountRatePercent / 100

    const simplePaybackRaw = annualNetGain > 0 ? investmentValue / annualNetGain : Infinity

    const yearRows: YearRow[] = []
    let cumulative = -investmentValue
    let cumulativeDiscounted = -investmentValue
    let discountedPayback = Infinity

    for (let y = 1; y <= usefulLifeYears; y++) {
        const cf = y === usefulLifeYears ? annualNetGain + residualValue : annualNetGain
        cumulative += cf
        const discountedCF = cf / Math.pow(1 + rate, y)
        cumulativeDiscounted += discountedCF

        if (discountedPayback === Infinity && cumulativeDiscounted >= 0) {
            const prevCum = cumulativeDiscounted - discountedCF
            discountedPayback = discountedCF > 0
                ? y - 1 + Math.abs(prevCum) / discountedCF
                : y
        }

        yearRows.push({ year: y, cashFlow: cf, cumulative, discountedCF, cumulativeDiscounted })
    }

    const totalReturn = annualNetGain * usefulLifeYears + residualValue
    const roi = ((totalReturn - investmentValue) / investmentValue) * 100
    const npv = cumulativeDiscounted

    return {
        simplePayback: simplePaybackRaw === Infinity ? -1 : simplePaybackRaw,
        discountedPayback: discountedPayback === Infinity ? -1 : discountedPayback,
        totalReturn,
        roi,
        npv,
        yearRows,
    }
}

export function validatePayback(input: PaybackInput): string | null {
    if (!input.investmentValue || input.investmentValue <= 0) return 'Informe o valor do investimento'
    if (input.investmentValue > 100_000_000) return 'Valor muito alto — verifique'
    if (!input.annualNetGain || input.annualNetGain <= 0) return 'O ganho anual deve ser maior que zero'
    if (!input.usefulLifeYears || input.usefulLifeYears < 1 || input.usefulLifeYears > 50) return 'Vida útil deve estar entre 1 e 50 anos'
    if (input.discountRatePercent < 0 || input.discountRatePercent > 50) return 'Taxa de desconto deve estar entre 0 e 50%'
    return null
}
