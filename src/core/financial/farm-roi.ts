// ── Farm ROI ──

export interface FarmROIInput {
    investment: number
    grossRevenue: number
    totalCost: number
    months: number
    cdiRateAnnual: number     // e.g. 13.75
}

export interface FarmROIResult {
    profit: number
    roi: number
    roiAnnualized: number
    cdiReturn: number
    cdiAnnual: number
}

export function calculateFarmROI(input: FarmROIInput): FarmROIResult {
    const { investment, grossRevenue, totalCost, months, cdiRateAnnual } = input

    const profit = grossRevenue - totalCost
    const roi = investment > 0 ? (profit / investment) * 100 : 0
    const roiAnnualized = months > 0
        ? (Math.pow(1 + roi / 100, 12 / months) - 1) * 100
        : 0

    const cdiMonthly = Math.pow(1 + cdiRateAnnual / 100, 1 / 12) - 1
    const cdiReturn = investment * (Math.pow(1 + cdiMonthly, months) - 1)

    return { profit, roi, roiAnnualized, cdiReturn, cdiAnnual: cdiRateAnnual }
}

export function validateFarmROI(input: FarmROIInput): string | null {
    if (!input.investment || input.investment <= 0) return 'Informe o investimento total'
    if (!input.grossRevenue) return 'Informe a receita bruta projetada'
    if (!input.totalCost) return 'Informe o custo total'
    if (!input.months || input.months <= 0) return 'Informe o prazo da operação'
    return null
}
