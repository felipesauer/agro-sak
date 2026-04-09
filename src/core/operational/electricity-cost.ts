// ── Electricity Cost ──

export interface ElectricityCostInput {
    power: number
    powerUnit: 'cv' | 'hp' | 'kw'
    hoursPerDay: number
    daysPerMonth: number
    months: number
    energyRatePerKwh: number
    demandChargePerKw: number
    areaHa?: number
}

export interface ElectricityCostResult {
    powerKW: number
    monthlyKWh: number
    annualKWh: number
    monthlyCostEnergy: number
    monthlyCostDemand: number
    monthlyCostTotal: number
    annualCost: number
    costPerHa: number | null
    costPerHour: number
}

export function calculateElectricityCost(input: ElectricityCostInput): ElectricityCostResult {
    const { power, powerUnit, hoursPerDay, daysPerMonth, months, energyRatePerKwh, demandChargePerKw, areaHa } = input

    let powerKW: number
    switch (powerUnit) {
        case 'hp': powerKW = power * 0.7457; break
        case 'cv': powerKW = power * 0.7355; break
        default: powerKW = power
    }

    const monthlyHours = hoursPerDay * daysPerMonth
    const monthlyKWh = powerKW * monthlyHours
    const annualKWh = monthlyKWh * months

    const monthlyCostEnergy = monthlyKWh * energyRatePerKwh
    const monthlyCostDemand = powerKW * demandChargePerKw
    const monthlyCostTotal = monthlyCostEnergy + monthlyCostDemand
    const annualCost = monthlyCostTotal * months
    const costPerHour = monthlyHours > 0 ? monthlyCostTotal / monthlyHours : 0

    const costPerHa = areaHa && areaHa > 0 ? annualCost / areaHa : null

    return { powerKW, monthlyKWh, annualKWh, monthlyCostEnergy, monthlyCostDemand, monthlyCostTotal, annualCost, costPerHa, costPerHour }
}

export function validateElectricityCost(input: ElectricityCostInput): string | null {
    if (!input.power || input.power <= 0) return 'A potência deve ser maior que zero'
    if (input.power > 10000) return 'Potência muito alta — verifique o valor'
    if (!input.hoursPerDay || input.hoursPerDay <= 0 || input.hoursPerDay > 24) return 'Horas por dia devem ser entre 1 e 24'
    if (!input.energyRatePerKwh || input.energyRatePerKwh <= 0) return 'Informe a tarifa de energia'
    return null
}
