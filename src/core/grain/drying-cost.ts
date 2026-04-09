// ── Drying Cost Calculator ──

export interface EnergySource {
    label: string
    unit: string
    kcalPerUnit: number
    efficiency: number
    pricePerUnit: number
}

export interface DryerCapacity {
    label: string
    throughput: number // tons/hour
}

export interface DryingCostInput {
    grainWeightTons: number
    initialMoisture: number
    targetMoisture: number
    energySource: EnergySource
    energyPriceOverride?: number
    dryerThroughput: number // tons/hour
    thirdPartyCostPerBag: number
    kcalPerKgWater: number
}

export interface DryingCostResult {
    waterToRemoveKg: number
    energyRequiredKcal: number
    fuelConsumed: number
    fuelUnit: string
    energyCost: number
    energyCostPerTon: number
    energyCostPerBag: number
    dryingTimeHours: number
    thirdPartyCostTotal: number
    thirdPartyCostPerTon: number
    savings: number
    ownIsCheaper: boolean
}

export function calculateDryingCost(input: DryingCostInput): DryingCostResult {
    const { grainWeightTons, initialMoisture, targetMoisture, energySource, dryerThroughput, thirdPartyCostPerBag, kcalPerKgWater } = input
    const price = input.energyPriceOverride ?? energySource.pricePerUnit

    const grainWeightKg = grainWeightTons * 1000
    const waterToRemoveKg = grainWeightKg * (initialMoisture - targetMoisture) / (100 - targetMoisture)

    const energyRequiredKcal = waterToRemoveKg * kcalPerKgWater
    const fuelConsumed = energyRequiredKcal / (energySource.kcalPerUnit * energySource.efficiency)

    const energyCost = fuelConsumed * price
    const energyCostPerTon = grainWeightTons > 0 ? energyCost / grainWeightTons : 0
    const energyCostPerBag = energyCostPerTon * 0.06

    const dryingTimeHours = dryerThroughput > 0 ? grainWeightTons / dryerThroughput : 0

    const totalBags = grainWeightKg / 60
    const thirdPartyCostTotal = totalBags * thirdPartyCostPerBag
    const thirdPartyCostPerTon = grainWeightTons > 0 ? thirdPartyCostTotal / grainWeightTons : 0

    const diff = thirdPartyCostTotal - energyCost

    return {
        waterToRemoveKg,
        energyRequiredKcal,
        fuelConsumed,
        fuelUnit: energySource.unit,
        energyCost,
        energyCostPerTon,
        energyCostPerBag,
        dryingTimeHours,
        thirdPartyCostTotal,
        thirdPartyCostPerTon,
        savings: Math.abs(diff),
        ownIsCheaper: diff > 0,
    }
}

export function validateDryingCost(input: { grainWeightTons: number; initialMoisture: number; targetMoisture: number }): string | null {
    if (!input.grainWeightTons || input.grainWeightTons <= 0) return 'A quantidade de grãos deve ser maior que zero'
    if (isNaN(input.initialMoisture) || input.initialMoisture <= 0 || input.initialMoisture > 50) return 'Umidade inicial deve estar entre 1% e 50%'
    if (isNaN(input.targetMoisture) || input.targetMoisture <= 0 || input.targetMoisture > 50) return 'Umidade final deve estar entre 1% e 50%'
    if (input.initialMoisture <= input.targetMoisture) return 'Umidade inicial deve ser maior que a final'
    return null
}
