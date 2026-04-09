// ── Crop Profitability domain logic (pure — zero React) ──

export interface CropProfitabilityEntry {
    name: string
    productivity: number
    price: number
    cost: number
}

export interface CropProfitabilityInputs {
    producerType: string
    crops: CropProfitabilityEntry[]
}

export interface CropProfitabilityResult {
    name: string
    revenue: number
    cost: number
    funrural: number
    profit: number
    roi: number
    margin: number
}

export function calculateCropProfitability(inputs: CropProfitabilityInputs): CropProfitabilityResult[] {
    const funruralRate = inputs.producerType === 'pj' ? 0.0285 : 0.015

    const results: CropProfitabilityResult[] = inputs.crops.map((c) => {
        const revenue = c.productivity * c.price
        const funrural = revenue * funruralRate
        const profit = revenue - c.cost - funrural
        const roi = c.cost > 0 ? (profit / c.cost) * 100 : 0
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0

        return {
            name: c.name,
            revenue,
            cost: c.cost,
            funrural,
            profit,
            roi,
            margin,
        }
    })

    results.sort((a, b) => b.profit - a.profit)
    return results
}

export function validateCropProfitability(inputs: CropProfitabilityInputs): string | null {
    if (inputs.crops.length < 2) return 'Preencha pelo menos 2 culturas para comparar'
    for (const c of inputs.crops) {
        if (c.productivity <= 0) return `Produtividade de "${c.name}" deve ser maior que 0`
        if (c.price <= 0) return `Preço de "${c.name}" deve ser maior que 0`
        if (c.cost <= 0) return `Custo de "${c.name}" deve ser maior que 0`
    }
    return null
}
