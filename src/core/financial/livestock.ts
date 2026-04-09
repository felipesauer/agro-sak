// ── Livestock Profitability ──

export interface LivestockInput {
    herdSize: number
    purchaseWeightArroba: number
    purchasePricePerArroba: number
    saleWeightArroba: number
    salePricePerArroba: number
    finishingMonths: number
    pastureCostPerHeadMonth: number
    supplementCostPerHeadMonth: number
    healthCostPerHead: number
    otherCostsPerHead: number
    mortalityRatePercent: number
}

export interface LivestockResult {
    purchaseTotal: number
    saleTotal: number
    effectiveHeads: number
    totalOperationalCost: number
    totalCost: number
    profit: number
    margin: number
    roi: number
    arrobasProduced: number
    costPerArroba: number
    revenuePerArroba: number
}

export function calculateLivestock(input: LivestockInput): LivestockResult {
    const {
        herdSize, purchaseWeightArroba, purchasePricePerArroba,
        saleWeightArroba, salePricePerArroba, finishingMonths,
        pastureCostPerHeadMonth, supplementCostPerHeadMonth,
        healthCostPerHead, otherCostsPerHead, mortalityRatePercent,
    } = input

    const purchaseTotal = herdSize * purchaseWeightArroba * purchasePricePerArroba
    const effectiveHeads = herdSize * (1 - mortalityRatePercent / 100)

    const pastureTotalCost = herdSize * pastureCostPerHeadMonth * finishingMonths
    const supplementTotalCost = herdSize * supplementCostPerHeadMonth * finishingMonths
    const healthTotalCost = herdSize * healthCostPerHead
    const otherTotalCost = herdSize * otherCostsPerHead
    const totalOperationalCost = pastureTotalCost + supplementTotalCost + healthTotalCost + otherTotalCost

    const saleTotal = effectiveHeads * saleWeightArroba * salePricePerArroba

    const totalCost = purchaseTotal + totalOperationalCost
    const profit = saleTotal - totalCost
    const margin = saleTotal > 0 ? (profit / saleTotal) * 100 : 0
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0

    const arrobasProduced = effectiveHeads * (saleWeightArroba - purchaseWeightArroba)
    const costPerArroba = arrobasProduced > 0 ? totalCost / arrobasProduced : 0
    const revenuePerArroba = arrobasProduced > 0 ? saleTotal / arrobasProduced : 0

    return {
        purchaseTotal, saleTotal, effectiveHeads, totalOperationalCost,
        totalCost, profit, margin, roi, arrobasProduced, costPerArroba, revenuePerArroba,
    }
}

export function validateLivestock(input: LivestockInput): string | null {
    if (!input.herdSize || input.herdSize <= 0) return 'Informe o tamanho do lote'
    if (!input.purchaseWeightArroba || input.purchaseWeightArroba <= 0) return 'Informe o peso de compra'
    if (!input.purchasePricePerArroba || input.purchasePricePerArroba <= 0) return 'Informe o preço de compra'
    if (!input.saleWeightArroba || input.saleWeightArroba <= 0) return 'Informe o peso de venda'
    if (!input.salePricePerArroba || input.salePricePerArroba <= 0) return 'Informe o preço de venda'
    if (!input.finishingMonths || input.finishingMonths <= 0) return 'Informe o tempo de engorda'
    if (input.saleWeightArroba <= input.purchaseWeightArroba) return 'Peso de venda deve ser maior que o de compra'
    return null
}
