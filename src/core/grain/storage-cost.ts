// ── Storage Cost: Own Silo vs Third-Party ──

export interface StorageCostInput {
    thirdPartyFeePerScMonth: number
    volumeAnnualSc: number
    avgMonths: number
    constructionCost: number
    siloLifeYears: number
    annualOpCost: number
}

export interface StorageCostResult {
    thirdPartyCostSc: number
    thirdPartyTotal: number
    ownCostSc: number
    ownTotal: number
    breakEvenYears: number
    annualSavings: number
}

export function calculateStorageCost(input: StorageCostInput): StorageCostResult {
    const { thirdPartyFeePerScMonth, volumeAnnualSc, avgMonths, constructionCost, siloLifeYears, annualOpCost } = input

    const thirdPartyCostSc = thirdPartyFeePerScMonth * avgMonths
    const thirdPartyTotal = thirdPartyCostSc * volumeAnnualSc

    const annualDepr = constructionCost / siloLifeYears
    const ownTotal = annualDepr + annualOpCost
    const ownCostSc = volumeAnnualSc > 0 ? ownTotal / volumeAnnualSc : 0

    const annualSavings = thirdPartyTotal - ownTotal
    const rawBreakEven = annualSavings > 0 ? constructionCost / annualSavings : 0

    return {
        thirdPartyCostSc,
        thirdPartyTotal,
        ownCostSc,
        ownTotal,
        breakEvenYears: rawBreakEven > 0 ? Math.ceil(rawBreakEven) : 0,
        annualSavings,
    }
}

export function validateStorageCost(input: { thirdPartyFeePerScMonth: number; volumeAnnualSc: number; constructionCost: number }): string | null {
    if (!input.thirdPartyFeePerScMonth || input.thirdPartyFeePerScMonth <= 0) return 'Informe a taxa de armazenagem'
    if (!input.volumeAnnualSc || input.volumeAnnualSc <= 0) return 'Informe o volume anual'
    if (!input.constructionCost || input.constructionCost <= 0) return 'Informe o custo de construção do silo'
    return null
}
