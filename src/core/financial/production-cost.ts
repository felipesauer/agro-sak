// ── Production Cost ──

export interface CostItem {
    key: string
    value: number
}

export interface CostGroupDef {
    label: string
    keys: string[]
}

export interface ProductionCostInput {
    expectedYieldScHa: number
    sacPrice: number
    costItems: Record<string, number>
    costGroups: CostGroupDef[]
}

export interface GroupTotal {
    label: string
    total: number
    percent: number
}

export interface ProductionCostResult {
    groupTotals: GroupTotal[]
    totalCostHa: number
    costPerSc: number
    breakEvenSc: number | null
    breakEvenPrice: number | null
}

export function calculateProductionCost(input: ProductionCostInput): ProductionCostResult {
    const { expectedYieldScHa, sacPrice, costItems, costGroups } = input

    let totalCostHa = 0
    const groupTotals: GroupTotal[] = []

    for (const group of costGroups) {
        let groupTotal = 0
        for (const key of group.keys) {
            groupTotal += costItems[key] || 0
        }
        totalCostHa += groupTotal
        groupTotals.push({ label: group.label, total: groupTotal, percent: 0 })
    }

    for (const g of groupTotals) {
        g.percent = totalCostHa > 0 ? (g.total / totalCostHa) * 100 : 0
    }

    const costPerSc = expectedYieldScHa > 0 ? totalCostHa / expectedYieldScHa : 0
    const breakEvenSc = sacPrice > 0 ? totalCostHa / sacPrice : null
    const breakEvenPrice = expectedYieldScHa > 0 ? totalCostHa / expectedYieldScHa : null

    return { groupTotals, totalCostHa, costPerSc, breakEvenSc, breakEvenPrice }
}

export function validateProductionCost(input: ProductionCostInput): string | null {
    if (!input.expectedYieldScHa || input.expectedYieldScHa <= 0) return 'Informe a produtividade esperada'
    return null
}
