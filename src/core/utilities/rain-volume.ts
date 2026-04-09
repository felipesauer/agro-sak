// ── Rain Volume Calculator ──

export const LITERS_PER_MM_PER_HA = 10_000

export interface RainVolumeInput {
    rainMm: number
    areaHa: number
    pricePerCubicMeter?: number
}

export interface RainVolumeResult {
    litersPerHa: number
    totalLiters: number
    totalCubicMeters: number
    equivalentCost: number
    alerts: string[]
}

export function calculateRainVolume(input: RainVolumeInput): RainVolumeResult {
    const { rainMm, areaHa } = input
    const price = input.pricePerCubicMeter ?? 0

    const litersPerHa = rainMm * LITERS_PER_MM_PER_HA
    const totalLiters = litersPerHa * areaHa
    const totalCubicMeters = totalLiters / 1000
    const equivalentCost = totalCubicMeters * price

    const alerts: string[] = []
    if (rainMm < 5) {
        alerts.push('Precipitação inferior a 5 mm. Em solo seco, essa chuva pode evaporar antes de infiltrar.')
    } else if (rainMm < 20) {
        alerts.push('Chuva leve a moderada. Boa para manutenção hídrica, mas insuficiente para recarregar o perfil do solo.')
    } else if (rainMm >= 50) {
        alerts.push('Precipitação intensa. Risco de escoamento superficial e erosão, especialmente em solos descobertos ou com declividade.')
    }

    return { litersPerHa, totalLiters, totalCubicMeters, equivalentCost, alerts }
}

export function validateRainVolume(input: RainVolumeInput): string | null {
    if (isNaN(input.rainMm) || input.rainMm <= 0) return 'Informe a precipitação em mm'
    if (isNaN(input.areaHa) || input.areaHa <= 0) return 'Informe a área em hectares'
    if (input.rainMm > 500) return 'Precipitação acima de 500 mm — verifique o valor'
    return null
}
