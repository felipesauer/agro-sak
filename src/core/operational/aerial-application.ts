// ── Aerial Application vs Ground ──

export interface AerialApplicationInput {
    areaHa: number
    aerialCostPerHa: number
    groundCostPerHa: number
    numApplications: number
    daysSavedPerApp: number
    dailyCropLossPerHa: number
    productCostPerHa: number
}

export interface AerialApplicationResult {
    aerialOperationTotal: number
    groundOperationTotal: number
    aerialProductTotal: number
    groundProductTotal: number
    aerialGrandTotal: number
    groundGrandTotal: number
    timeSavingsValue: number
    netSavings: number
    totalDaysSaved: number
}

export function calculateAerialApplication(input: AerialApplicationInput): AerialApplicationResult {
    const { areaHa, aerialCostPerHa, groundCostPerHa, numApplications, daysSavedPerApp, dailyCropLossPerHa, productCostPerHa } = input

    const aerialOperationTotal = aerialCostPerHa * areaHa * numApplications
    const groundOperationTotal = groundCostPerHa * areaHa * numApplications

    const aerialProductTotal = productCostPerHa * areaHa * numApplications
    const groundProductTotal = productCostPerHa * areaHa * numApplications

    const aerialGrandTotal = aerialOperationTotal + aerialProductTotal
    const groundGrandTotal = groundOperationTotal + groundProductTotal

    const totalDaysSaved = daysSavedPerApp * numApplications
    const timeSavingsValue = dailyCropLossPerHa * areaHa * totalDaysSaved

    const netSavings = (groundGrandTotal - aerialGrandTotal) + timeSavingsValue

    return {
        aerialOperationTotal,
        groundOperationTotal,
        aerialProductTotal,
        groundProductTotal,
        aerialGrandTotal,
        groundGrandTotal,
        timeSavingsValue,
        netSavings,
        totalDaysSaved,
    }
}

export function validateAerialApplication(input: AerialApplicationInput): string | null {
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área'
    if (!input.aerialCostPerHa || input.aerialCostPerHa <= 0) return 'Informe o custo da aplicação aérea'
    if (!input.groundCostPerHa || input.groundCostPerHa <= 0) return 'Informe o custo da aplicação terrestre'
    if (!input.numApplications || input.numApplications <= 0) return 'Informe o número de aplicações'
    return null
}
