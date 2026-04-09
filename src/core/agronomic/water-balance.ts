// ── Water Balance ──

export interface WaterBalanceInput {
    crop: string
    phase: string
    soilTexture: string
    precipWeekMm: number
    precipMonthMm: number
    tempMean: number
    tempMax: number
    tempMin: number
    customKc?: number
}

export interface WaterBalanceResult {
    eto: number
    etc: number
    kc: number
    weeklyDemand: number
    weeklyBalance: number
    monthlyBalance: number
    irrigationLamina: number
    condition: string
    conditionVariant: 'info' | 'success' | 'warning' | 'error'
    recommendation: string
}

const KC: Record<string, Record<string, number>> = {
    soybean: { vegetative: 0.80, flowering: 1.10, grain_fill: 1.00, maturation: 0.50 },
    corn: { vegetative: 0.75, flowering: 1.15, grain_fill: 1.05, maturation: 0.60 },
    cotton: { vegetative: 0.70, flowering: 1.15, grain_fill: 1.00, maturation: 0.65 },
    wheat: { vegetative: 0.70, flowering: 1.10, grain_fill: 1.00, maturation: 0.40 },
    bean: { vegetative: 0.75, flowering: 1.10, grain_fill: 0.95, maturation: 0.35 },
    rice: { vegetative: 1.05, flowering: 1.20, grain_fill: 1.10, maturation: 0.90 },
    coffee: { vegetative: 0.90, flowering: 0.95, grain_fill: 0.95, maturation: 0.90 },
    sugarcane: { vegetative: 0.60, flowering: 1.25, grain_fill: 1.10, maturation: 0.75 },
}

const SOIL_FACTOR: Record<string, number> = {
    sandy: 0.7,
    medium: 1.0,
    clay: 1.2,
}

const RA = 15.0

export function calculateWaterBalance(input: WaterBalanceInput): WaterBalanceResult | null {
    const { crop, phase, soilTexture, precipWeekMm, precipMonthMm, tempMean, tempMax, tempMin, customKc } = input

    const kc = crop === 'custom'
        ? (customKc ?? 1.0)
        : (KC[crop]?.[phase] ?? 1.0)
    const soilFactor = SOIL_FACTOR[soilTexture] ?? 1.0

    const tRange = Math.max(tempMax - tempMin, 0.1)
    const eto = 0.0023 * (tempMean + 17.8) * Math.sqrt(tRange) * RA

    const etc = eto * kc

    const weeklyDemand = etc * 7
    const weeklyBalance = precipWeekMm - weeklyDemand
    const monthlyBalance = precipMonthMm - etc * 30

    const effectiveBalance = weeklyBalance * soilFactor

    let condition: string
    let conditionVariant: 'info' | 'success' | 'warning' | 'error'
    let recommendation: string

    if (effectiveBalance >= 10) {
        condition = 'Excesso hídrico'
        conditionVariant = 'info'
        recommendation = 'Solo pode estar saturado. Verifique drenagem e aeração.'
    } else if (effectiveBalance >= -5) {
        condition = 'Adequado'
        conditionVariant = 'success'
        recommendation = 'Balanço hídrico dentro do ideal. Manter monitoramento.'
    } else if (effectiveBalance >= -20) {
        condition = 'Déficit leve'
        conditionVariant = 'warning'
        recommendation = 'Atenção: iniciar irrigação se possível. Monitorar previsão do tempo.'
    } else {
        condition = 'Déficit severo'
        conditionVariant = 'error'
        recommendation = 'Irrigação urgente! Risco alto de perda de produtividade.'
    }

    if (phase === 'flowering' && effectiveBalance < -5) {
        condition = 'Déficit CRÍTICO (Floração)'
        conditionVariant = 'error'
        recommendation = 'ALERTA MÁXIMO: Floração com déficit hídrico causa perda irreversível de produtividade. Irrigar imediatamente!'
    }

    const irrigationLamina = effectiveBalance < 0 ? Math.abs(effectiveBalance) : 0

    return {
        eto,
        etc,
        kc,
        weeklyDemand,
        weeklyBalance,
        monthlyBalance,
        irrigationLamina,
        condition,
        conditionVariant,
        recommendation,
    }
}

export function validateWaterBalance(input: WaterBalanceInput): string | null {
    if (isNaN(input.tempMean) || isNaN(input.tempMax) || isNaN(input.tempMin)) return 'Informe as temperaturas'
    if (input.tempMax < input.tempMin) return 'Temperatura máxima deve ser maior que a mínima'
    if (isNaN(input.precipWeekMm) && isNaN(input.precipMonthMm)) return 'Informe ao menos a precipitação da semana'
    return null
}
