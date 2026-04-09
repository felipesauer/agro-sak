// ── Machinery Cost: Own vs Rental vs Outsource ──

export const RESIDUAL_VALUE: Record<string, number> = {
    tractor: 0.3,
    harvester: 0.2,
    planter: 0.15,
    sprayer: 0.2,
}

export interface MachineryCostInput {
    machineType: string
    purchasePrice: number
    lifeYears: number
    hoursPerYear: number
    capitalRate: number       // fraction, e.g. 0.08
    insuranceRate: number     // fraction
    maintenanceRate: number   // fraction
    fuelConsumptionLPerH: number
    dieselPrice: number
    operatorSalary: number
    operationalCapacityHaPerH: number
    rentalHourly: number
    rentalIncludesOperator: boolean
    rentalIncludesFuel: boolean
    outsourcePerHa: number
}

export interface CostBreakdown {
    depreciation: number
    interest: number
    insurance: number
    maintenance: number
    fuel: number
    operator: number
    total: number
    perHa: number
}

export interface MachineryCostResult {
    own: CostBreakdown
    rental: { totalH: number; perHa: number }
    outsource: { perHa: number }
    cheapest: string
    breakEvenHoursPerYear: number
}

export function calculateMachineryCost(input: MachineryCostInput): MachineryCostResult {
    const {
        machineType, purchasePrice, lifeYears, hoursPerYear,
        capitalRate, insuranceRate, maintenanceRate,
        fuelConsumptionLPerH, dieselPrice, operatorSalary,
        operationalCapacityHaPerH,
        rentalHourly, rentalIncludesOperator, rentalIncludesFuel,
        outsourcePerHa,
    } = input

    const vr = RESIDUAL_VALUE[machineType] ?? 0.2

    const depreciation = (purchasePrice * (1 - vr)) / (lifeYears * hoursPerYear)
    const interest = (purchasePrice * capitalRate) / hoursPerYear
    const insurance = (purchasePrice * insuranceRate) / hoursPerYear
    const maintenance = (purchasePrice * maintenanceRate) / hoursPerYear
    const fuel = fuelConsumptionLPerH * dieselPrice
    const operator = (operatorSalary * 13.33) / hoursPerYear
    const total = depreciation + interest + insurance + maintenance + fuel + operator
    const perHa = total / operationalCapacityHaPerH

    const own: CostBreakdown = { depreciation, interest, insurance, maintenance, fuel, operator, total, perHa }

    // Rental
    let rentalH = rentalHourly
    if (!rentalIncludesOperator) rentalH += operator
    if (!rentalIncludesFuel) rentalH += fuel
    const rentalHa = rentalH / operationalCapacityHaPerH

    // Cheapest
    const costs = [
        { label: 'Própria', v: perHa },
        { label: 'Aluguel', v: rentalHa },
        { label: 'Terceirização', v: outsourcePerHa },
    ]
    costs.sort((a, b) => a.v - b.v)
    const cheapest = costs[0].label

    // Break-even hours/year where own = rental
    const fixedAnnual = (purchasePrice * (1 - vr)) / lifeYears + purchasePrice * (capitalRate + insuranceRate + maintenanceRate)
    const ownVariable = fuel + operator
    const savingPerH = rentalHourly - ownVariable
    const breakEvenHoursPerYear = savingPerH > 0 ? Math.round(fixedAnnual / savingPerH) : 0

    return {
        own,
        rental: { totalH: rentalH, perHa: rentalHa },
        outsource: { perHa: outsourcePerHa },
        cheapest,
        breakEvenHoursPerYear,
    }
}

export function validateMachineryCost(input: MachineryCostInput): string | null {
    if (!input.purchasePrice || input.purchasePrice <= 0) return 'Informe o valor de compra'
    if (!input.hoursPerYear || input.hoursPerYear <= 0) return 'Informe as horas de uso por ano'
    if (!input.operationalCapacityHaPerH || input.operationalCapacityHaPerH <= 0) return 'Informe a capacidade operacional (ha/h)'
    return null
}
