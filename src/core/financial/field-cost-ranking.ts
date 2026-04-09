// ── Field Cost Ranking ──

export interface FieldEntry {
    name: string
    areaHa: number
    productivityScHa: number
    inputCostPerHa: number
    operationCostPerHa: number
    leaseCostPerHa: number
    otherCostPerHa: number
}

export interface FieldResult {
    name: string
    areaHa: number
    totalCost: number
    costPerHa: number
    costPerSc: number
    revenuePerHa: number
    profitPerHa: number
    profit: number
}

export function calculateFieldCostRanking(fields: FieldEntry[], pricePerSc: number): FieldResult[] {
    const results: FieldResult[] = fields
        .filter(f => f.areaHa > 0 && f.productivityScHa > 0)
        .map(f => {
            const costPerHa = f.inputCostPerHa + f.operationCostPerHa + f.leaseCostPerHa + f.otherCostPerHa
            const totalCost = costPerHa * f.areaHa
            const costPerSc = f.productivityScHa > 0 ? costPerHa / f.productivityScHa : 0
            const revenuePerHa = f.productivityScHa * pricePerSc
            const profitPerHa = revenuePerHa - costPerHa
            const profit = profitPerHa * f.areaHa
            return { name: f.name, areaHa: f.areaHa, totalCost, costPerHa, costPerSc, revenuePerHa, profitPerHa, profit }
        })

    results.sort((a, b) => b.profitPerHa - a.profitPerHa)
    return results
}

export function validateFieldCostRanking(fields: FieldEntry[]): string | null {
    const valid = fields.filter(f => f.areaHa > 0 && f.productivityScHa > 0)
    if (valid.length === 0) return 'Informe ao menos 1 talhão com área e produtividade'
    return null
}
