// ── Operational Capacity ──

export interface OperationalCapacityInput {
    workWidthM: number
    speedKmH: number
    efficiencyPercent: number
    areaHa?: number
    hoursPerDay?: number
}

export interface OperationalCapacityResult {
    haPerHour: number
    hoursNeeded: number | null
    daysNeeded: number | null
}

export function calculateOperationalCapacity(input: OperationalCapacityInput): OperationalCapacityResult {
    const { workWidthM, speedKmH, efficiencyPercent, areaHa, hoursPerDay } = input

    const haPerHour = (workWidthM * speedKmH * (efficiencyPercent / 100)) / 10

    const hoursNeeded = areaHa && areaHa > 0 ? areaHa / haPerHour : null
    const daysNeeded = hoursNeeded !== null && hoursPerDay && hoursPerDay > 0 ? hoursNeeded / hoursPerDay : null

    return { haPerHour, hoursNeeded, daysNeeded }
}

export function validateOperationalCapacity(input: OperationalCapacityInput): string | null {
    if (!input.workWidthM || input.workWidthM <= 0) return 'Informe a largura de trabalho'
    if (!input.speedKmH || input.speedKmH <= 0) return 'Informe a velocidade de trabalho'
    if (!input.efficiencyPercent || input.efficiencyPercent <= 0 || input.efficiencyPercent > 100) return 'Eficiência deve estar entre 1% e 100%'
    return null
}
