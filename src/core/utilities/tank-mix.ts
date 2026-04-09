// ── Tank Mix ──

export type FormulationType = 'SC' | 'WG' | 'EC' | 'SL'

export interface TankMixProduct {
    name: string
    formulation: FormulationType
    dosePerHa: number
    unit: 'L' | 'kg'
}

export interface TankMixInput {
    tankVolumeL: number
    sprayVolumeLHa: number
    areaHa: number
    products: TankMixProduct[]
}

export interface ProductResult {
    name: string
    formulation: FormulationType
    perTank: number
    total: number
    unit: string
}

export interface TankMixResult {
    tanksNeeded: number
    products: ProductResult[]
    additionOrder: string[]
}

const ADDITION_PRIORITY: Record<FormulationType, number> = {
    WG: 1,
    SC: 2,
    EC: 3,
    SL: 4,
}

export function calculateTankMix(input: TankMixInput): TankMixResult | null {
    const { tankVolumeL, sprayVolumeLHa, areaHa, products } = input
    if (tankVolumeL <= 0 || sprayVolumeLHa <= 0 || areaHa <= 0) return null

    const validProducts = products.filter((p) => p.name && p.dosePerHa > 0)
    if (validProducts.length === 0) return null

    const tanksNeeded = (areaHa * sprayVolumeLHa) / tankVolumeL

    const productResults: ProductResult[] = validProducts.map((p) => {
        const perTank = p.dosePerHa * (tankVolumeL / sprayVolumeLHa)
        const total = p.dosePerHa * areaHa
        return {
            name: p.name,
            formulation: p.formulation,
            perTank,
            total,
            unit: p.unit === 'L' ? 'L' : 'kg',
        }
    })

    const additionOrder = [...validProducts]
        .sort((a, b) => (ADDITION_PRIORITY[a.formulation] ?? 99) - (ADDITION_PRIORITY[b.formulation] ?? 99))
        .map((p) => `${p.name} (${p.formulation})`)

    return { tanksNeeded, products: productResults, additionOrder }
}

export function validateTankMix(input: TankMixInput): string | null {
    if (!input.tankVolumeL || input.tankVolumeL <= 0) return 'Informe o volume do tanque'
    if (!input.sprayVolumeLHa || input.sprayVolumeLHa <= 0) return 'Informe o volume de calda por hectare'
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área a ser aplicada'
    const valid = input.products.filter((p) => p.name && p.dosePerHa > 0)
    if (valid.length === 0) return 'Adicione pelo menos um produto com nome e dose'
    return null
}
