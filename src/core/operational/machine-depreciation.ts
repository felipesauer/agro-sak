// ── Machine Depreciation ──

export interface MachineDepreciationInput {
    purchasePrice: number
    residualPercent: number
    lifeYears: number
    totalLifeHours: number
    hoursPerYear: number
    method: 'linear' | 'hours'
}

export interface YearRow {
    year: number
    depreciation: number
    maintenance: number
    marketValue: number
}

export interface MachineDepreciationResult {
    depreciationYear: number
    depreciationHour: number
    yearTable: YearRow[]
    totalCostOfOwnership: number
    alertLifePercent: number
}

export function maintenanceRate(year: number): number {
    if (year <= 3) return 0.02
    if (year <= 6) return 0.035
    return 0.05
}

export function calculateMachineDepreciation(input: MachineDepreciationInput): MachineDepreciationResult {
    const { purchasePrice, residualPercent, lifeYears, totalLifeHours, hoursPerYear, method } = input

    const residual = purchasePrice * (residualPercent / 100)
    const depreciable = purchasePrice - residual

    let depreciationYear: number
    let depreciationHour: number

    if (method === 'linear') {
        depreciationYear = depreciable / lifeYears
        depreciationHour = depreciationYear / hoursPerYear
    } else {
        depreciationHour = depreciable / totalLifeHours
        depreciationYear = depreciationHour * hoursPerYear
    }

    const yearTable: YearRow[] = []
    let accumulated = 0
    let tco = 0

    for (let y = 1; y <= lifeYears; y++) {
        accumulated += depreciationYear
        const mntRate = maintenanceRate(y)
        const maintenance = purchasePrice * mntRate
        const marketValue = Math.max(purchasePrice - accumulated, residual)
        tco += depreciationYear + maintenance
        yearTable.push({ year: y, depreciation: depreciationYear, maintenance, marketValue })
    }

    const hoursUsed = hoursPerYear * lifeYears
    const alertLifePercent = totalLifeHours > 0 ? (hoursUsed / totalLifeHours) * 100 : 0

    return { depreciationYear, depreciationHour, yearTable, totalCostOfOwnership: tco, alertLifePercent }
}

export function validateMachineDepreciation(input: { purchasePrice: number; lifeYears: number }): string | null {
    if (!input.purchasePrice || input.purchasePrice <= 0) return 'Informe o valor de aquisição'
    if (!input.lifeYears || input.lifeYears <= 0) return 'Informe a vida útil'
    return null
}
