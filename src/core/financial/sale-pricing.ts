// ── Sale Pricing ──

export const FUNRURAL_RATE: Record<string, number> = {
    pf: 1.5,
    pj: 2.85,
}

export interface SalePricingInput {
    costPerSc: number
    producerType: string       // 'pf' | 'pj'
    icmsPercent: number
    desiredMarginPercent: number
    brokerFeePercent: number
    marketPrice?: number
}

export interface SalePricingResult {
    totalTaxRate: number
    minPrice: number
    priceWithMargin: number
    markup: number
    marketDiff: number | null
}

export function calculateSalePricing(input: SalePricingInput): SalePricingResult {
    const { costPerSc, producerType, icmsPercent, desiredMarginPercent, brokerFeePercent, marketPrice } = input

    const funrural = FUNRURAL_RATE[producerType] ?? 1.5
    const totalTaxRate = funrural + icmsPercent + brokerFeePercent

    // min price = cost / (1 - taxes/100)
    const minPrice = costPerSc / (1 - totalTaxRate / 100)

    // price with margin = cost / (1 - (taxes + margin)/100)
    const priceWithMargin = costPerSc / (1 - (totalTaxRate + desiredMarginPercent) / 100)

    const markup = ((priceWithMargin - costPerSc) / costPerSc) * 100

    const marketDiff = marketPrice && marketPrice > 0 ? marketPrice - priceWithMargin : null

    return { totalTaxRate, minPrice, priceWithMargin, markup, marketDiff }
}

export function validateSalePricing(input: SalePricingInput): string | null {
    if (!input.costPerSc || input.costPerSc <= 0) return 'Informe o custo de produção por saca'
    const funrural = FUNRURAL_RATE[input.producerType] ?? 1.5
    const totalDeduct = funrural + input.icmsPercent + input.desiredMarginPercent + input.brokerFeePercent
    if (totalDeduct >= 100) return 'Impostos + margem não podem somar 100% ou mais'
    return null
}
