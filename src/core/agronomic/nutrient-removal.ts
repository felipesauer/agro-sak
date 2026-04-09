// ── Nutrient Removal (Exportação de Nutrientes) ──

export interface NutrientCoefficients {
    n: number       // kg/t
    p2o5: number
    k2o: number
    s: number
}

export const STRAW_FACTOR: Record<string, number> = {
    soybean: 1.30, corn: 1.50, wheat: 1.40, cotton: 1.20,
    coffee: 1.15, rice: 1.60, sugarcane: 1.00, bean: 1.30,
}

export interface NutrientRemovalInput {
    productivityScHa: number
    bagWeightKg: number
    coefficients: NutrientCoefficients
    includeStraw: boolean
    strawFactor?: number       // override
    areaHa?: number            // optional for total
}

export interface NutrientRow {
    nutrient: string
    kgPerHa: number
    totalKg: number | null
}

export interface NutrientRemovalResult {
    rows: NutrientRow[]
}

export function calculateNutrientRemoval(input: NutrientRemovalInput): NutrientRemovalResult {
    const { productivityScHa, bagWeightKg, coefficients, includeStraw, strawFactor, areaHa } = input

    const tonsPerHa = (productivityScHa * bagWeightKg) / 1000
    const sf = includeStraw ? (strawFactor ?? 1.3) : 1

    const nutrients: { key: keyof NutrientCoefficients; label: string }[] = [
        { key: 'n', label: 'N (Nitrogênio)' },
        { key: 'p2o5', label: 'P₂O₅ (Fósforo)' },
        { key: 'k2o', label: 'K₂O (Potássio)' },
        { key: 's', label: 'S (Enxofre)' },
    ]

    const rows: NutrientRow[] = nutrients.map(({ key, label }) => {
        const kgPerHa = tonsPerHa * coefficients[key] * sf
        return { nutrient: label, kgPerHa, totalKg: areaHa && areaHa > 0 ? kgPerHa * areaHa : null }
    })

    return { rows }
}

export function validateNutrientRemoval(input: NutrientRemovalInput): string | null {
    if (!input.productivityScHa || input.productivityScHa <= 0) return 'Informe a produtividade'
    return null
}
