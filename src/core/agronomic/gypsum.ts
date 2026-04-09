// ── Gypsum Calculator ──

export type GypsumMethod = 'sousa' | 'clay' | 'raij'

export interface GypsumInput {
    method: GypsumMethod
    Ca: number               // cmolc/dm³
    Mg?: number              // cmolc/dm³
    Al?: number              // cmolc/dm³
    ctc?: number             // cmolc/dm³
    clayPercent?: number
    targetDepthCm: number    // 20, 40, or 60
    areaHa: number
    gypPricePerTon: number
}

export interface GypsumResult {
    gypsumNeedKgHa: number
    gypsumNeedTHa: number
    totalTons: number
    totalCost: number
    costPerHa: number
    justified: boolean
    reasons: string[]
}

export function calculateGypsum(input: GypsumInput): GypsumResult | null {
    const { method, Ca, Mg, Al, ctc, clayPercent, targetDepthCm, areaHa, gypPricePerTon } = input

    const lowCa = Ca < 0.5
    const highAl = Al !== undefined && Al > 0.5
    const lowCaCTC = ctc !== undefined && ctc > 0 && (Ca / ctc) * 100 < 25
    const lowCaMg = Mg !== undefined && (Ca + Mg) < 1.0

    const justified = lowCa || highAl || lowCaCTC || lowCaMg
    const reasons: string[] = []
    if (lowCa) reasons.push('Ca subsuperficial baixo')
    if (highAl) reasons.push('Al tóxico elevado')
    if (lowCaCTC) reasons.push('Saturação de Ca na CTC < 25%')
    if (lowCaMg) reasons.push('Ca + Mg baixo')
    if (!justified) reasons.push('Indicadores dentro da faixa adequada')

    let gypsumNeedKgHa = 0

    switch (method) {
        case 'sousa':
            if (clayPercent === undefined || clayPercent <= 0) return null
            gypsumNeedKgHa = 50 * clayPercent
            break
        case 'clay':
            if (clayPercent === undefined || clayPercent <= 0) return null
            gypsumNeedKgHa = 75 * clayPercent
            break
        case 'raij':
            if (ctc === undefined || ctc <= 0) return null
            gypsumNeedKgHa = 6 * (ctc * 10) // CTC in mmolc = cmolc * 10
            break
    }

    const depthFactor = targetDepthCm / 20
    gypsumNeedKgHa *= depthFactor

    const gypsumNeedTHa = gypsumNeedKgHa / 1000
    const totalTons = gypsumNeedTHa * areaHa
    const costPerHa = gypsumNeedTHa * gypPricePerTon
    const totalCost = costPerHa * areaHa

    return { gypsumNeedKgHa, gypsumNeedTHa, totalTons, totalCost, costPerHa, justified, reasons }
}

export function validateGypsum(input: GypsumInput): string | null {
    if (input.Ca === undefined || input.Ca < 0) return 'Informe o teor de cálcio (Ca)'
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área em hectares'
    if (input.method === 'raij' && (input.ctc === undefined || input.ctc <= 0)) return 'O método Van Raij exige o valor da CTC'
    if ((input.method === 'sousa' || input.method === 'clay') && (input.clayPercent === undefined || input.clayPercent <= 0)) return 'Informe o teor de argila (%)'
    return null
}
