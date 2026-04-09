// ── Storage Viability: Sell Now vs Store ──

export interface StorageViabilityInput {
    quantitySc: number
    currentPricePerSc: number
    futurePricePerSc: number
    storageMonths: number
    storageFeePerScMonth: number
    breakageRatePctMonth: number
    capitalRatePctMonth: number
    insuranceRatePctMonth: number
}

export interface StorageViabilityResult {
    immediateRevenue: number
    storageCost: number
    capitalCost: number
    insuranceCost: number
    totalCost: number
    breakageSc: number
    futureRevenue: number
    netGain: number
    recommendation: string
    breakEvenPrice: number
}

export function calculateStorageViability(input: StorageViabilityInput): StorageViabilityResult {
    const { quantitySc, currentPricePerSc, futurePricePerSc, storageMonths, storageFeePerScMonth } = input
    const breakPct = input.breakageRatePctMonth / 100
    const capPct = input.capitalRatePctMonth / 100
    const insPct = input.insuranceRatePctMonth / 100

    const immediateRevenue = quantitySc * currentPricePerSc
    const storageCost = quantitySc * storageFeePerScMonth * storageMonths
    const breakageSc = quantitySc * breakPct * storageMonths
    const capitalCost = immediateRevenue * capPct * storageMonths
    const insuranceCost = immediateRevenue * insPct * storageMonths
    const totalCost = storageCost + capitalCost + insuranceCost
    const netQty = quantitySc - breakageSc
    const futureRevenue = netQty * futurePricePerSc - totalCost
    const netGain = futureRevenue - immediateRevenue

    const recommendation = netGain > 0
        ? 'Vale armazenar — ganho projetado positivo'
        : 'Melhor vender agora — custo de armazenagem supera o ganho'

    const breakEvenPrice = netQty > 0 ? (immediateRevenue + totalCost) / netQty : 0

    return {
        immediateRevenue,
        storageCost,
        capitalCost,
        insuranceCost,
        totalCost,
        breakageSc,
        futureRevenue,
        netGain,
        recommendation,
        breakEvenPrice,
    }
}

export function validateStorageViability(input: { quantitySc: number; currentPricePerSc: number; futurePricePerSc: number; storageMonths: number }): string | null {
    if (!input.quantitySc || input.quantitySc <= 0) return 'Informe a quantidade'
    if (!input.currentPricePerSc || input.currentPricePerSc <= 0) return 'Informe o preço atual'
    if (!input.futurePricePerSc) return 'Informe o preço futuro esperado'
    if (!input.storageMonths || input.storageMonths <= 0) return 'Informe o prazo de armazenagem'
    return null
}
