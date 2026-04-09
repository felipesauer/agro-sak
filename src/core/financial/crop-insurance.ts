// ── Crop Insurance ──

export interface CropInsuranceInput {
    insuranceType: 'psr' | 'proagro' | 'proagro_mais'
    areaHa: number
    yieldScHa: number
    pricePerBag: number
    coverageLevelPercent: number
    premiumRatePercent: number
    subsidyRatePercent: number
    financedValue?: number          // required for proagro
    proagroRatePercent?: number    // for proagro / proagro_mais
}

export interface ScenarioRow {
    lossPct: number
    indemnity: number
    netResult: number
}

export interface CropInsuranceResult {
    insuredValuePerHa: number
    insuredValueTotal: number
    grossPremium: number
    subsidyAmount: number
    farmerPremium: number
    farmerPremiumPerHa: number
    coverageValuePerHa: number
    coverageValueTotal: number
    breakEvenLossPct: number
    scenarios: ScenarioRow[]
}

function buildScenarios(revenuePerHa: number, areaHa: number, coveragePerHa: number, premiumPerHa: number): ScenarioRow[] {
    return [20, 40, 60, 80, 100].map(lossPct => {
        const lostRevenue = revenuePerHa * (lossPct / 100)
        const indemnityPerHa = Math.min(lostRevenue, coveragePerHa)
        const netResult = (indemnityPerHa - premiumPerHa) * areaHa
        return { lossPct, indemnity: indemnityPerHa * areaHa, netResult }
    })
}

export function calculateCropInsurance(input: CropInsuranceInput): CropInsuranceResult | null {
    const { insuranceType, areaHa, yieldScHa, pricePerBag, coverageLevelPercent, premiumRatePercent, subsidyRatePercent } = input

    const revenuePerHa = yieldScHa * pricePerBag
    const revenueTotal = revenuePerHa * areaHa
    const coveragePct = coverageLevelPercent / 100

    if (insuranceType === 'proagro' || insuranceType === 'proagro_mais') {
        const financedValue = input.financedValue
        if (!financedValue || financedValue <= 0) return null

        const rate = (input.proagroRatePercent ?? 4) / 100
        const grossPremium = rate * financedValue
        const coverageValueTotal = financedValue
        const coverageValuePerHa = financedValue / areaHa

        return {
            insuredValuePerHa: revenuePerHa,
            insuredValueTotal: revenueTotal,
            grossPremium,
            subsidyAmount: 0,
            farmerPremium: grossPremium,
            farmerPremiumPerHa: grossPremium / areaHa,
            coverageValuePerHa,
            coverageValueTotal,
            breakEvenLossPct: grossPremium > 0 ? (grossPremium / coverageValueTotal) * 100 : 0,
            scenarios: buildScenarios(revenuePerHa, areaHa, coverageValuePerHa, grossPremium / areaHa),
        }
    }

    // PSR
    const rate = premiumRatePercent / 100
    const grossPremium = revenueTotal * rate
    const subsidyAmount = grossPremium * (subsidyRatePercent / 100)
    const farmerPremium = grossPremium - subsidyAmount
    const farmerPremiumPerHa = farmerPremium / areaHa

    const coverageValuePerHa = revenuePerHa * coveragePct
    const coverageValueTotal = revenueTotal * coveragePct

    const breakEvenLossPct = farmerPremium > 0 ? (farmerPremium / coverageValueTotal) * 100 : 0

    return {
        insuredValuePerHa: revenuePerHa,
        insuredValueTotal: revenueTotal,
        grossPremium,
        subsidyAmount,
        farmerPremium,
        farmerPremiumPerHa,
        coverageValuePerHa,
        coverageValueTotal,
        breakEvenLossPct,
        scenarios: buildScenarios(revenuePerHa, areaHa, coverageValuePerHa, farmerPremiumPerHa),
    }
}

export function validateCropInsurance(input: CropInsuranceInput): string | null {
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área em hectares'
    if (input.areaHa > 100_000) return 'Área muito grande — verifique o valor'
    if (!input.yieldScHa || input.yieldScHa <= 0) return 'A produtividade deve ser maior que zero'
    if (!input.pricePerBag || input.pricePerBag <= 0) return 'O preço deve ser maior que zero'
    if (input.pricePerBag < 50 || input.pricePerBag > 2000) return 'Preço por saca fora do intervalo usual (R$ 50–R$ 2.000)'
    if ((input.insuranceType === 'proagro' || input.insuranceType === 'proagro_mais') && (!input.financedValue || input.financedValue <= 0)) {
        return 'Informe o valor financiado para o Proagro'
    }
    return null
}
