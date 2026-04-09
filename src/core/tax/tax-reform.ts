// ── Tax Reform domain logic (pure — zero React) ──

export interface TaxReformInputs {
    producerType: string
    annualRevenue: number
    domesticPercent: number
    inputCost: number
}

export interface TaxReformRates {
    cbsRate: number
    ibsRate: number
}

export interface TaxReformResult {
    currentFunrural: number
    currentTotal: number
    newCBS: number
    newIBS: number
    newGrossTotal: number
    newCredits: number
    newNetTotal: number
    difference: number
    differencePercent: number
}

export function calculateTaxReform(inputs: TaxReformInputs, rates: TaxReformRates): TaxReformResult {
    const funruralRate = inputs.producerType === 'pj' ? 0.0285 : 0.015
    const domesticRevenue = inputs.annualRevenue * (inputs.domesticPercent / 100)
    const currentFunrural = domesticRevenue * funruralRate
    const currentTotal = currentFunrural

    // New regime (IBS + CBS) — agro gets 60% reduction (pays 40%)
    const agroDiscount = 0.4
    const cbsEffective = (rates.cbsRate / 100) * agroDiscount
    const ibsEffective = (rates.ibsRate / 100) * agroDiscount
    const totalEffective = cbsEffective + ibsEffective

    const newCBS = domesticRevenue * cbsEffective
    const newIBS = domesticRevenue * ibsEffective
    const newGrossTotal = newCBS + newIBS

    // Credits on inputs
    const newCredits = inputs.inputCost * totalEffective
    const newNetTotal = Math.max(0, newGrossTotal - newCredits)

    const difference = newNetTotal - currentTotal
    const differencePercent = currentTotal > 0 ? (difference / currentTotal) * 100 : 0

    return {
        currentFunrural,
        currentTotal,
        newCBS,
        newIBS,
        newGrossTotal,
        newCredits,
        newNetTotal,
        difference,
        differencePercent,
    }
}

export function validateTaxReform(inputs: TaxReformInputs, rates: TaxReformRates | null): string | null {
    if (inputs.annualRevenue <= 0) return 'Informe o faturamento anual'
    if (inputs.domesticPercent < 0 || inputs.domesticPercent > 100) return 'Mercado interno deve estar entre 0% e 100%'
    if (!rates) return 'Aguardando taxas da API...'
    if (rates.cbsRate <= 0 && rates.ibsRate <= 0) return 'Taxas CBS/IBS inválidas'
    return null
}
