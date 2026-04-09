// ── Irrigation ──

export interface IrrigationInput {
    crop: string
    phase: string
    fieldCapacity: number
    wiltingPoint: number
    rootDepth: number
    precipitationMm: number
    tempMax: number
    tempMin: number
    tempMean: number
    irrigationSystem: string
    customKc?: number
}

export interface IrrigationResult {
    eto: number
    etc: number
    kc: number
    netLamina: number
    grossLamina: number
    irrigationInterval: number
    applicationHours: number
    alert: string | null
}

const KC: Record<string, Record<string, number>> = {
    soybean: { initial: 0.40, development: 0.85, flowering: 1.10, maturation: 0.50 },
    corn: { initial: 0.35, development: 0.80, flowering: 1.15, maturation: 0.60 },
    cotton: { initial: 0.35, development: 0.75, flowering: 1.15, maturation: 0.65 },
    bean: { initial: 0.40, development: 0.80, flowering: 1.10, maturation: 0.50 },
    wheat: { initial: 0.30, development: 0.75, flowering: 1.10, maturation: 0.40 },
    rice: { initial: 1.05, development: 1.10, flowering: 1.20, maturation: 0.90 },
    coffee: { initial: 0.90, development: 0.90, flowering: 0.95, maturation: 0.90 },
    sugarcane: { initial: 0.50, development: 0.80, flowering: 1.25, maturation: 0.75 },
}

const SYSTEM_EFFICIENCY: Record<string, number> = {
    pivot: 0.85,
    drip: 0.92,
    sprinkler: 0.70,
}

const APPLICATION_RATE: Record<string, number> = {
    pivot: 6,
    drip: 3,
    sprinkler: 8,
}

const RA_TROPICAL = 15.0

export function calculateIrrigation(input: IrrigationInput): IrrigationResult | null {
    const { crop, phase, fieldCapacity, wiltingPoint, rootDepth, precipitationMm, tempMax, tempMin, tempMean, irrigationSystem, customKc } = input

    const kc = crop === 'custom'
        ? (customKc ?? 1.0)
        : (KC[crop]?.[phase] ?? 1.0)

    const efficiency = SYSTEM_EFFICIENCY[irrigationSystem] ?? 0.85

    const tRange = Math.max(tempMax - tempMin, 0.1)
    const eto = 0.0023 * (tempMean + 17.8) * Math.sqrt(tRange) * RA_TROPICAL

    const etc = eto * kc

    const netLamina = (fieldCapacity - wiltingPoint) * rootDepth * 0.50

    const grossLamina = netLamina / efficiency

    const effectiveEtc = Math.max(etc - precipitationMm / 7, 0.1)
    const irrigationInterval = netLamina / effectiveEtc

    const appRate = APPLICATION_RATE[irrigationSystem] ?? 6
    const applicationHours = grossLamina / appRate

    let alert: string | null = null
    if (phase === 'flowering' && precipitationMm < etc * 7 * 0.5) {
        alert = 'ATENÇÃO: Fase de floração com déficit hídrico! Risco máximo de perda de produtividade.'
    }

    return { eto, etc, kc, netLamina, grossLamina, irrigationInterval, applicationHours, alert }
}

export function validateIrrigation(input: IrrigationInput): string | null {
    if (isNaN(input.tempMax) || isNaN(input.tempMin) || isNaN(input.tempMean)) return 'Informe as temperaturas'
    if (input.fieldCapacity <= input.wiltingPoint) return 'Capacidade de campo deve ser maior que ponto de murcha'
    if (isNaN(input.rootDepth) || input.rootDepth <= 0) return 'Profundidade radicular deve ser positiva'
    return null
}
