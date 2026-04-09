// ── ITR domain logic (pure — zero React) ──

export interface ItrInput {
    totalArea: number
    usedArea: number
    vtnPerHa: number
}

export interface ItrResult {
    gu: number
    rate: number
    vtnTotal: number
    itrAnnual: number
    itrPerHa: number
    guLabel: string
}

// Row: area bracket, Col: GU bracket
// Source: Lei 9.393/1996
const ITR_RATE_MATRIX = [
    //  ≥80%   65-80%  50-65%    <50%
    [0.03,   0.20,   0.40,   1.00],  // ≤ 50 ha
    [0.07,   0.40,   0.80,   2.00],  // 50-200
    [0.10,   0.60,   1.30,   3.00],  // 200-500
    [0.15,   0.85,   1.90,   4.30],  // 500-1000
    [0.45,   3.00,   5.16,   8.60],  // > 1000
] as const

const GU_LABELS = [
    '≥ 80% (Alto)',
    '65–80% (Médio-alto)',
    '50–65% (Médio)',
    '< 50% (Baixo)',
] as const

export function getAreaBracket(area: number): number {
    if (area <= 50) return 0
    if (area <= 200) return 1
    if (area <= 500) return 2
    if (area <= 1000) return 3
    return 4
}

export function getGUBracket(gu: number): number {
    if (gu >= 80) return 0
    if (gu >= 65) return 1
    if (gu >= 50) return 2
    return 3
}

export function calculateItr(input: ItrInput): ItrResult {
    const gu = (input.usedArea / input.totalArea) * 100
    const areaBracket = getAreaBracket(input.totalArea)
    const guBracket = getGUBracket(gu)
    const rate = ITR_RATE_MATRIX[areaBracket][guBracket]

    const vtnTotal = input.vtnPerHa * input.totalArea
    const itrAnnual = vtnTotal * (rate / 100)
    const itrPerHa = itrAnnual / input.totalArea

    return {
        gu,
        rate,
        vtnTotal,
        itrAnnual,
        itrPerHa,
        guLabel: GU_LABELS[guBracket],
    }
}

export function validateItr(input: ItrInput): string | null {
    if (input.totalArea <= 0) return 'Informe a área total'
    if (input.usedArea <= 0) return 'Informe a área utilizada'
    if (input.vtnPerHa <= 0) return 'Informe o VTN por hectare'
    if (input.usedArea > input.totalArea) return 'Área utilizada não pode ser maior que a área total'
    return null
}
