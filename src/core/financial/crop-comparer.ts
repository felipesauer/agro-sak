// ── Crop Comparer ──

export interface CropEntry {
    name: string
    productivity: number
    price: number
    productionCost: number
}

export interface CropCompareResult {
    name: string
    revenuePerHa: number
    costPerHa: number
    profitPerHa: number
    roi: number
    margin: number
    isBest: boolean
}

export function calculateCropComparer(crops: CropEntry[]): CropCompareResult[] | null {
    if (crops.length < 2) return null

    const results: CropCompareResult[] = crops.map((c) => {
        const revenue = c.productivity * c.price
        const profit = revenue - c.productionCost
        const roi = c.productionCost > 0 ? (profit / c.productionCost) * 100 : 0
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0
        return {
            name: c.name,
            revenuePerHa: revenue,
            costPerHa: c.productionCost,
            profitPerHa: profit,
            roi,
            margin,
            isBest: false,
        }
    })

    results.sort((a, b) => b.profitPerHa - a.profitPerHa)
    results[0].isBest = true

    return results
}

export function validateCropComparer(crops: CropEntry[]): string | null {
    if (crops.length < 2) return 'Selecione ao menos 2 culturas para comparar'
    for (const c of crops) {
        if (!c.name) return 'Informe o nome de todas as culturas'
        if (c.productivity <= 0) return `Produtividade de "${c.name}" deve ser maior que zero`
        if (c.price <= 0) return `Preço de "${c.name}" deve ser maior que zero`
        if (c.productionCost <= 0) return `Custo de produção de "${c.name}" deve ser maior que zero`
    }
    return null
}
