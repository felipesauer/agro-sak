// ── Fuel Consumption per Hectare ──

export interface FuelConsumptionInput {
    consumptionLPerHour: number
    operationalCapacityHaPerHour: number
    dieselPricePerLiter: number
    areaHa?: number
}

export interface FuelConsumptionResult {
    litersPerHa: number
    costPerHa: number
    totalCost: number | null
    totalLiters: number | null
}

export function calculateFuelConsumption(input: FuelConsumptionInput): FuelConsumptionResult {
    const { consumptionLPerHour, operationalCapacityHaPerHour, dieselPricePerLiter, areaHa } = input

    const litersPerHa = consumptionLPerHour / operationalCapacityHaPerHour
    const costPerHa = litersPerHa * dieselPricePerLiter

    const totalCost = areaHa && areaHa > 0 ? costPerHa * areaHa : null
    const totalLiters = areaHa && areaHa > 0 ? litersPerHa * areaHa : null

    return { litersPerHa, costPerHa, totalCost, totalLiters }
}

export function validateFuelConsumption(input: FuelConsumptionInput): string | null {
    if (!input.consumptionLPerHour || input.consumptionLPerHour <= 0) return 'Informe o consumo do motor (L/h)'
    if (!input.operationalCapacityHaPerHour || input.operationalCapacityHaPerHour <= 0) return 'Capacidade operacional deve ser positiva'
    if (!input.dieselPricePerLiter || input.dieselPricePerLiter <= 0) return 'Informe o preço do diesel'
    return null
}
