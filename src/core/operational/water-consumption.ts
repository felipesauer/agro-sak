// ── Water Consumption for Irrigation ──

/** 1 cv = 0.7355 kW */
export const CV_TO_KW = 0.7355

export interface WaterConsumptionInput {
    areaHa: number
    et0MmDay: number          // reference evapotranspiration
    kc: number                // crop coefficient
    efficiencyPercent: number // irrigation system efficiency
    pumpPowerCv: number       // pump power in cv (cavalo-vapor)
    electricityCostPerKwh: number
    hoursPerDay: number
}

export interface WaterConsumptionResult {
    dailyLaminaMm: number
    dailyWaterM3: number
    monthlyWaterM3: number
    dailyEnergyCost: number
    monthlyEnergyCost: number
    costPerMm: number
    costPerHaMonth: number
}

export function calculateWaterConsumption(input: WaterConsumptionInput): WaterConsumptionResult {
    const { areaHa, et0MmDay, kc, efficiencyPercent, pumpPowerCv, electricityCostPerKwh, hoursPerDay } = input
    const efficiency = efficiencyPercent / 100

    // ETc (mm/day)
    const etc = et0MmDay * kc

    // Gross lamina (mm/day) considering system efficiency
    const dailyLaminaMm = efficiency > 0 ? etc / efficiency : etc

    // 1 mm on 1 ha = 10 m³
    const dailyWaterM3 = dailyLaminaMm * areaHa * 10
    const monthlyWaterM3 = dailyWaterM3 * 30

    // Energy cost
    const pumpKw = pumpPowerCv * CV_TO_KW
    const dailyEnergyKwh = pumpKw * hoursPerDay
    const dailyEnergyCost = dailyEnergyKwh * electricityCostPerKwh
    const monthlyEnergyCost = dailyEnergyCost * 30

    // Cost per mm applied across entire area
    const costPerMm = dailyLaminaMm > 0 ? dailyEnergyCost / dailyLaminaMm : 0

    // Cost per hectare per month
    const costPerHaMonth = areaHa > 0 ? monthlyEnergyCost / areaHa : 0

    return {
        dailyLaminaMm,
        dailyWaterM3,
        monthlyWaterM3,
        dailyEnergyCost,
        monthlyEnergyCost,
        costPerMm,
        costPerHaMonth,
    }
}

export function validateWaterConsumption(input: WaterConsumptionInput): string | null {
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área'
    if (!input.et0MmDay || input.et0MmDay <= 0) return 'Informe a ET0'
    if (!input.kc || input.kc <= 0) return 'Informe o Kc'
    if (!input.efficiencyPercent || input.efficiencyPercent <= 0 || input.efficiencyPercent > 100)
        return 'Eficiência deve ser entre 1 e 100%'
    if (!input.pumpPowerCv || input.pumpPowerCv <= 0) return 'Informe a potência da bomba'
    if (!input.electricityCostPerKwh || input.electricityCostPerKwh <= 0) return 'Informe o custo da energia'
    return null
}
