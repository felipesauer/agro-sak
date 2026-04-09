// ── Yield Converter ──

export interface YieldConverterInput {
    value: number
    fromUnit: 'sc_ha' | 'kg_ha' | 't_ha' | 'bu_ac'
    bagWeightKg: number
    buAcFactor: number | null  // sc/ha → bu/ac conversion factor
}

export interface YieldConverterResult {
    scHa: number
    kgHa: number
    tHa: number
    buAc: number | null
}

export function calculateYieldConverter(input: YieldConverterInput): YieldConverterResult | null {
    const { value, fromUnit, bagWeightKg, buAcFactor } = input

    let kgHa: number
    switch (fromUnit) {
        case 'sc_ha':
            kgHa = value * bagWeightKg
            break
        case 'kg_ha':
            kgHa = value
            break
        case 't_ha':
            kgHa = value * 1000
            break
        case 'bu_ac':
            if (!buAcFactor) return null
            kgHa = (value / buAcFactor) * bagWeightKg
            break
        default:
            return null
    }

    const scHa = kgHa / bagWeightKg
    const tHa = kgHa / 1000
    const buAc = buAcFactor ? scHa * buAcFactor : null

    return { scHa, kgHa, tHa, buAc }
}

export function validateYieldConverter(input: { value: number; fromUnit: string; buAcFactor: number | null }): string | null {
    if (isNaN(input.value) || !input.value) return 'Informe o valor de produtividade'
    if (input.value < 0) return 'O valor não pode ser negativo'
    if (input.fromUnit === 'bu_ac' && !input.buAcFactor) return 'Conversão bushel/acre não disponível para esta cultura'
    return null
}
