// ── Seed Treatment ──

export interface SeedTreatmentProduct {
    name: string
    type: string
    dosePerKg: number     // mL per 100 kg of seed
    pricePerLiter: number
}

export interface SeedTreatmentSlot {
    product: SeedTreatmentProduct
    customDose?: number
    customPrice?: number
}

export interface SeedTreatmentInput {
    areaHa: number
    seedRateKgHa: number
    slots: SeedTreatmentSlot[]
}

export interface ProductResult {
    name: string
    type: string
    dosePerKg: number
    totalMl: number
    totalLiters: number
    cost: number
}

export interface SeedTreatmentResult {
    totalSeedKg: number
    products: ProductResult[]
    totalCostPerHa: number
    totalCostTotal: number
    totalVolumePerHa: number
}

export function calculateSeedTreatment(input: SeedTreatmentInput): SeedTreatmentResult {
    const { areaHa, seedRateKgHa, slots } = input
    const totalSeedKg = seedRateKgHa * areaHa

    const products: ProductResult[] = slots.map(s => {
        const dose = s.customDose ?? s.product.dosePerKg
        const price = s.customPrice ?? s.product.pricePerLiter
        const totalMl = (dose / 100) * totalSeedKg
        const totalLiters = totalMl / 1000
        const cost = totalLiters * price
        return { name: s.product.name, type: s.product.type, dosePerKg: dose, totalMl, totalLiters, cost }
    })

    const totalCostTotal = products.reduce((sum, p) => sum + p.cost, 0)
    const totalCostPerHa = areaHa > 0 ? totalCostTotal / areaHa : 0
    const totalVolumePerHa = areaHa > 0 ? products.reduce((sum, p) => sum + p.totalMl, 0) / areaHa : 0

    return { totalSeedKg, products, totalCostPerHa, totalCostTotal, totalVolumePerHa }
}

export function validateSeedTreatment(input: SeedTreatmentInput): string | null {
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área em hectares'
    if (!input.seedRateKgHa || input.seedRateKgHa <= 0) return 'Informe a taxa de semeadura (kg/ha)'
    if (input.slots.length === 0) return 'Selecione pelo menos um produto para o tratamento'
    return null
}
