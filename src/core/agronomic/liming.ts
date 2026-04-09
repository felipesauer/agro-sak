// ── Liming (Calagem) domain logic (pure — zero React) ──

export interface LimingInput {
    ctc: number        // CTC a pH 7 (cmolc/dm³)
    v1: number         // Current base saturation (%)
    v2: number         // Target base saturation (%)
    prnt: number       // PRNT of limestone (%)
    depth: 20 | 40     // Incorporation depth (cm)
    limePrice?: number // Optional R$/t for cost estimate
}

export interface LimingResult {
    nc: number             // Base NC for 0-20cm (t/ha)
    ncAdjusted: number     // NC adjusted for depth (t/ha)
    costPerHa: number | null
    needsSplitting: boolean
}

/**
  * Base Saturation Method (Método da Saturação por Bases):
  * NC (t/ha) = (V2 - V1) × CTC / (10 × PRNT/100)
  *
  * Source: Raij et al. — Boletim 100 (IAC)
  */
export function calculateLiming(input: LimingInput): LimingResult {
    const nc = ((input.v2 - input.v1) * input.ctc) / (10 * (input.prnt / 100))
    const depthFactor = input.depth === 40 ? 2 : 1
    const ncAdjusted = Math.max(0, nc * depthFactor)
    const costPerHa = input.limePrice && input.limePrice > 0
        ? ncAdjusted * input.limePrice
        : null

    return {
        nc: Math.max(0, nc),
        ncAdjusted,
        costPerHa,
        needsSplitting: ncAdjusted > 5,
    }
}

export function validateLiming(input: LimingInput): string | null {
    if (input.ctc <= 0) return 'Informe a CTC a pH 7'
    if (input.v1 <= 0) return 'Informe a saturação por bases atual (V%)'
    if (input.v2 <= 0) return 'Informe a saturação por bases desejada'
    if (input.prnt < 50 || input.prnt > 100) return 'PRNT deve estar entre 50% e 100%'
    if (input.v1 >= input.v2) return 'V% desejada deve ser maior que a atual'
    return null
}
