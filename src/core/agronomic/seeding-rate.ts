// ── Seeding Rate ──

export interface SeedingRateInput {
    population: number        // plants/ha desired
    rowSpacingCm: number
    germinationPercent: number // 50-100
    vigorPercent: number       // 50-100
    tswGrams: number           // peso de mil sementes (g)
    bagWeightKg: number        // saco comercial (40, 50 etc.)
    seedPricePerBag?: number   // optional
}

export interface SeedingRateResult {
    seedsPerMeter: number
    adjustedSeedsPerHa: number
    kgPerHa: number
    bagsPerHa: number
    costPerHa: number | null
}

export function calculateSeedingRate(input: SeedingRateInput): SeedingRateResult {
    const { population, rowSpacingCm, germinationPercent, vigorPercent, tswGrams, bagWeightKg, seedPricePerBag } = input

    const spacingM = rowSpacingCm / 100
    const seedsPerMeter = (population * spacingM) / 10_000

    const efficiency = (germinationPercent / 100) * (vigorPercent / 100)
    const adjustedSeedsPerHa = population / efficiency

    const kgPerHa = (adjustedSeedsPerHa * tswGrams) / 1_000_000
    const bagsPerHa = kgPerHa / bagWeightKg

    const costPerHa = seedPricePerBag && seedPricePerBag > 0 ? bagsPerHa * seedPricePerBag : null

    return { seedsPerMeter, adjustedSeedsPerHa, kgPerHa, bagsPerHa, costPerHa }
}

export function validateSeedingRate(input: SeedingRateInput): string | null {
    if (!input.population || input.population <= 0) return 'Informe a população desejada'
    if (!input.rowSpacingCm || input.rowSpacingCm <= 0) return 'Informe o espaçamento entre linhas'
    if (!input.germinationPercent) return 'Informe a germinação da semente'
    if (!input.vigorPercent) return 'Informe o vigor / fator de campo'
    if (!input.tswGrams || input.tswGrams <= 0) return 'Informe o peso de mil sementes (PMG)'
    if (input.germinationPercent < 50 || input.germinationPercent > 100) return 'Germinação deve estar entre 50% e 100%'
    if (input.vigorPercent < 50 || input.vigorPercent > 100) return 'Vigor deve estar entre 50% e 100%'
    return null
}
