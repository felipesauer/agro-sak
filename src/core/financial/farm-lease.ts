// ── Farm Lease ──

export interface FarmLeaseInput {
    paymentMode: 'sacks' | 'fixed'
    leaseValue: number           // sc/ha or R$/ha
    expectedYieldScHa: number
    sacPrice: number
    areaHa: number
    costWithoutLease: number
}

export interface FarmLeaseResult {
    leaseCostHa: number
    totalLeaseCost: number
    percentOfCost: number
    percentOfRevenue: number
    revenueHa: number
}

export function calculateFarmLease(input: FarmLeaseInput): FarmLeaseResult {
    const { paymentMode, leaseValue, expectedYieldScHa, sacPrice, areaHa, costWithoutLease } = input

    const leaseCostHa = paymentMode === 'sacks' ? leaseValue * sacPrice : leaseValue
    const totalLeaseCost = leaseCostHa * areaHa
    const totalCost = costWithoutLease + leaseCostHa
    const percentOfCost = totalCost > 0 ? (leaseCostHa / totalCost) * 100 : 0
    const revenueHa = expectedYieldScHa * sacPrice
    const percentOfRevenue = revenueHa > 0 ? (leaseCostHa / revenueHa) * 100 : 0

    return { leaseCostHa, totalLeaseCost, percentOfCost, percentOfRevenue, revenueHa }
}

export function validateFarmLease(input: FarmLeaseInput): string | null {
    if (!input.leaseValue || input.leaseValue <= 0) return 'Informe o valor do arrendamento'
    if (!input.sacPrice || input.sacPrice <= 0) return 'Informe o preço da saca'
    if (!input.expectedYieldScHa) return 'Informe a produtividade esperada'
    return null
}
