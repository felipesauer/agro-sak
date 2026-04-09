// ── Spray Mix — Dose per Tank ──

export interface SprayMixInput {
    tankVolumeLiters: number
    sprayVolumeLPerHa: number
    dosePerHa: number
}

export interface SprayMixResult {
    perTank: number
    per100L: number
    areaCoveredPerTank: number
}

export function calculateSprayMix(input: SprayMixInput): SprayMixResult {
    const { tankVolumeLiters, sprayVolumeLPerHa, dosePerHa } = input

    const areaCoveredPerTank = tankVolumeLiters / sprayVolumeLPerHa
    const perTank = dosePerHa * areaCoveredPerTank
    const per100L = dosePerHa * (100 / sprayVolumeLPerHa)

    return { perTank, per100L, areaCoveredPerTank }
}

export function validateSprayMix(input: SprayMixInput): string | null {
    if (!input.tankVolumeLiters || input.tankVolumeLiters <= 0) return 'Informe o volume do tanque'
    if (!input.sprayVolumeLPerHa || input.sprayVolumeLPerHa <= 0) return 'Volume de calda deve ser positivo'
    if (!input.dosePerHa || input.dosePerHa <= 0) return 'Informe a dose por hectare'
    return null
}
