// ── Harvest Cost: Own vs Third-party ──

export interface HarvestCostInput {
    areaHa: number
    purchasePrice: number
    usefulLifeYears: number
    hoursPerYear: number
    fuelConsumptionLPerH: number
    dieselPricePerL: number
    operatorMonthlySalary: number
    maintenancePercent: number
    thirdPartyPricePerHa: number
    productivityScHa: number
}

export interface HarvestCostResult {
    depreciation: number
    fuelCostPerHa: number
    laborCostPerHa: number
    maintenanceCostPerHa: number
    ownCostPerHa: number
    thirdPartyCostPerHa: number
    ownCostPerSac: number
    thirdPartyCostPerSac: number
    savingsPerHa: number
    savingsTotal: number
    breakEvenArea: number
}

export function calculateHarvestCost(input: HarvestCostInput): HarvestCostResult {
    const { areaHa, purchasePrice, usefulLifeYears, hoursPerYear, fuelConsumptionLPerH, dieselPricePerL, operatorMonthlySalary, maintenancePercent, thirdPartyPricePerHa, productivityScHa } = input

    const haPerHour = areaHa / hoursPerYear || 1

    const annualDepreciation = purchasePrice / usefulLifeYears
    const depreciation = annualDepreciation / areaHa

    const fuelCostPerHa = (fuelConsumptionLPerH / haPerHour) * dieselPricePerL
    const laborCostPerHa = (operatorMonthlySalary * 12) / areaHa
    const maintenanceCostPerHa = (purchasePrice * (maintenancePercent / 100)) / areaHa

    const ownCostPerHa = depreciation + fuelCostPerHa + laborCostPerHa + maintenanceCostPerHa

    const ownCostPerSac = productivityScHa > 0 ? ownCostPerHa / productivityScHa : 0
    const thirdPartyCostPerSac = productivityScHa > 0 ? thirdPartyPricePerHa / productivityScHa : 0

    const savingsPerHa = thirdPartyPricePerHa - ownCostPerHa
    const savingsTotal = savingsPerHa * areaHa

    const fixedCosts = annualDepreciation + (purchasePrice * maintenancePercent / 100) + (operatorMonthlySalary * 12)
    const breakEvenArea = (thirdPartyPricePerHa - fuelCostPerHa) > 0
        ? fixedCosts / (thirdPartyPricePerHa - fuelCostPerHa)
        : 0

    return {
        depreciation,
        fuelCostPerHa,
        laborCostPerHa,
        maintenanceCostPerHa,
        ownCostPerHa,
        thirdPartyCostPerHa: thirdPartyPricePerHa,
        ownCostPerSac,
        thirdPartyCostPerSac,
        savingsPerHa,
        savingsTotal,
        breakEvenArea,
    }
}

export function validateHarvestCost(input: HarvestCostInput): string | null {
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área'
    if (!input.purchasePrice || input.purchasePrice <= 0) return 'Informe o valor da colhedora'
    if (!input.usefulLifeYears || input.usefulLifeYears <= 0) return 'Informe a vida útil'
    if (!input.hoursPerYear || input.hoursPerYear <= 0) return 'Informe as horas/ano'
    if (!input.fuelConsumptionLPerH || input.fuelConsumptionLPerH <= 0) return 'Informe o consumo de combustível'
    if (!input.dieselPricePerL || input.dieselPricePerL <= 0) return 'Informe o preço do diesel'
    if (!input.operatorMonthlySalary || input.operatorMonthlySalary <= 0) return 'Informe o salário do operador'
    if (!input.thirdPartyPricePerHa || input.thirdPartyPricePerHa <= 0) return 'Informe o valor do terceirizado'
    if (!input.productivityScHa || input.productivityScHa <= 0) return 'Informe a produtividade'
    return null
}
