// ── Sprayer Calibration ──

export interface SprayerCalibrationInput {
    flowPerNozzleLPerMin: number
    speedKmH: number
    nozzleSpacingM: number
    tankCapacityL: number
    dosePerHa?: number
}

export interface SprayerCalibrationResult {
    sprayVolumeLPerHa: number
    areaCoveredPerTank: number
    productPerTank: number | null
    volumeAlert: string | null
}

export function calculateSprayerCalibration(input: SprayerCalibrationInput): SprayerCalibrationResult {
    const { flowPerNozzleLPerMin, speedKmH, nozzleSpacingM, tankCapacityL, dosePerHa } = input

    // L/ha = (flow × 600) / (speed × spacing)
    const sprayVolumeLPerHa = (flowPerNozzleLPerMin * 600) / (speedKmH * nozzleSpacingM)
    const areaCoveredPerTank = tankCapacityL / sprayVolumeLPerHa
    const productPerTank = dosePerHa && dosePerHa > 0 ? dosePerHa * areaCoveredPerTank : null

    let volumeAlert: string | null = null
    if (sprayVolumeLPerHa < 50) volumeAlert = 'Volume abaixo de 50 L/ha — risco de deriva e cobertura insuficiente.'
    else if (sprayVolumeLPerHa > 400) volumeAlert = 'Volume acima de 400 L/ha — impraticável para a maioria das operações.'

    return { sprayVolumeLPerHa, areaCoveredPerTank, productPerTank, volumeAlert }
}

export function validateSprayerCalibration(input: SprayerCalibrationInput): string | null {
    if (!input.flowPerNozzleLPerMin || input.flowPerNozzleLPerMin <= 0) return 'Informe a vazão por bico'
    if (!input.speedKmH || input.speedKmH <= 0) return 'Velocidade deve ser positiva'
    if (!input.nozzleSpacingM || input.nozzleSpacingM <= 0) return 'Espaçamento deve ser positivo'
    if (!input.tankCapacityL || input.tankCapacityL <= 0) return 'Informe a capacidade do tanque'
    return null
}
