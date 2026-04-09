// ── Drying Loss domain logic (pure — zero React) ──

export interface DryingLossInput {
    initialWeight: number     // kg
    initialMoisture: number   // %
    targetMoisture: number    // %
    dryingCostPerBag?: number // R$/sc (optional)
    pricePerBag?: number      // R$/sc (optional)
    bagWeight?: number        // kg per bag (default 60)
}

export interface DryingLossResult {
    finalWeightKg: number
    lossKg: number
    lossPercent: number
    lossBags: number
    dryingCost: number
    financialLoss: number
}

/**
  * Dry matter conservation:
  * Final weight = Initial × (100 - Ui) / (100 - Uf)
  *
  * Source: Classic grain drying formula (EMBRAPA)
  */
export function calculateDryingLoss(input: DryingLossInput): DryingLossResult {
    const bagWt = input.bagWeight ?? 60
    const finalWeightKg =
        input.initialWeight * ((100 - input.initialMoisture) / (100 - input.targetMoisture))
    const lossKg = input.initialWeight - finalWeightKg
    const lossBags = lossKg / bagWt

    const dryingCost = input.dryingCostPerBag
        ? (input.initialWeight / bagWt) * input.dryingCostPerBag
        : 0
    const financialLoss = input.pricePerBag ? lossBags * input.pricePerBag : 0

    return {
        finalWeightKg,
        lossKg,
        lossPercent: input.initialWeight > 0 ? (lossKg / input.initialWeight) * 100 : 0,
        lossBags,
        dryingCost,
        financialLoss,
    }
}

export function validateDryingLoss(input: DryingLossInput): string | null {
    if (input.initialWeight <= 0) return 'Informe o peso inicial'
    if (input.initialMoisture <= 0) return 'Informe a umidade inicial'
    if (input.targetMoisture <= 0) return 'Informe a umidade final desejada'
    if (input.initialMoisture <= input.targetMoisture)
        return 'Umidade inicial deve ser maior que a final'
    return null
}
