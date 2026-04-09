// ── Grain Freight Cost ──

export interface GrainFreightInput {
    distanceKm: number
    freightPerKm: number
    loadTons: number
    sacPrice: number
    sacWeightKg: number
}

export interface GrainFreightResult {
    totalFreight: number
    costPerTon: number
    costPerSac: number
    freightPercent: number
}

export function calculateGrainFreight(input: GrainFreightInput): GrainFreightResult {
    const { distanceKm, freightPerKm, loadTons, sacPrice, sacWeightKg } = input

    const totalFreight = distanceKm * freightPerKm
    const costPerTon = loadTons > 0 ? totalFreight / loadTons : 0
    const sacsPerTon = 1000 / sacWeightKg
    const costPerSac = costPerTon / sacsPerTon
    const freightPercent = sacPrice > 0 ? (costPerSac / sacPrice) * 100 : 0

    return { totalFreight, costPerTon, costPerSac, freightPercent }
}

export function validateGrainFreight(input: GrainFreightInput): string | null {
    if (!input.distanceKm || input.distanceKm <= 0) return 'Informe a distância'
    if (!input.freightPerKm || input.freightPerKm <= 0) return 'Informe o valor do frete por km'
    if (!input.loadTons || input.loadTons <= 0) return 'Informe a carga'
    return null
}
