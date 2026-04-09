// ── Micronutrient Correction ──

export type NutrientStatus = 'Baixo' | 'Médio' | 'Alto'

export const THRESHOLDS: Record<string, { low: number; high: number }> = {
    zn: { low: 0.5, high: 1.0 },
    b: { low: 0.2, high: 0.6 },
    cu: { low: 0.3, high: 0.8 },
    mn: { low: 1.5, high: 5.0 },
}

export const DOSES: Record<string, Record<string, Record<NutrientStatus, number>>> = {
    soybean: { zn: { Baixo: 6, Médio: 3, Alto: 0 }, b: { Baixo: 2, Médio: 1, Alto: 0 }, cu: { Baixo: 3, Médio: 1.5, Alto: 0 }, mn: { Baixo: 6, Médio: 3, Alto: 0 } },
    corn: { zn: { Baixo: 6, Médio: 3, Alto: 0 }, b: { Baixo: 1.5, Médio: 0.5, Alto: 0 }, cu: { Baixo: 3, Médio: 1.5, Alto: 0 }, mn: { Baixo: 6, Médio: 3, Alto: 0 } },
    cotton: { zn: { Baixo: 6, Médio: 3, Alto: 0 }, b: { Baixo: 3, Médio: 1.5, Alto: 0 }, cu: { Baixo: 3, Médio: 1.5, Alto: 0 }, mn: { Baixo: 6, Médio: 3, Alto: 0 } },
    coffee: { zn: { Baixo: 8, Médio: 4, Alto: 0 }, b: { Baixo: 3, Médio: 1.5, Alto: 0 }, cu: { Baixo: 4, Médio: 2, Alto: 0 }, mn: { Baixo: 8, Médio: 4, Alto: 0 } },
    wheat: { zn: { Baixo: 5, Médio: 2.5, Alto: 0 }, b: { Baixo: 1.5, Médio: 0.5, Alto: 0 }, cu: { Baixo: 2, Médio: 1, Alto: 0 }, mn: { Baixo: 5, Médio: 2.5, Alto: 0 } },
    sugarcane: { zn: { Baixo: 6, Médio: 3, Alto: 0 }, b: { Baixo: 2, Médio: 1, Alto: 0 }, cu: { Baixo: 3, Médio: 1.5, Alto: 0 }, mn: { Baixo: 8, Médio: 4, Alto: 0 } },
}

export function classifyMicronutrient(nutrient: string, value: number): NutrientStatus {
    const t = THRESHOLDS[nutrient]
    if (!t) return 'Médio'
    if (value < t.low) return 'Baixo'
    if (value >= t.high) return 'Alto'
    return 'Médio'
}

export interface MicronutrientInput {
    crop: string
    areaHa: number
    zn?: number   // mg/dm³
    b?: number
    cu?: number
    mn?: number
}

export interface MicronutrientResult {
    name: string
    symbol: string
    value: number
    status: NutrientStatus
    doseKgHa: number
    totalKg: number
}

export interface MicronutrientCorrectionResult {
    nutrients: MicronutrientResult[]
}

export function calculateMicronutrientCorrection(input: MicronutrientInput): MicronutrientCorrectionResult {
    const keys: { key: keyof MicronutrientInput; name: string; symbol: string }[] = [
        { key: 'zn', name: 'Zinco', symbol: 'Zn' },
        { key: 'b', name: 'Boro', symbol: 'B' },
        { key: 'cu', name: 'Cobre', symbol: 'Cu' },
        { key: 'mn', name: 'Manganês', symbol: 'Mn' },
    ]

    const nutrients: MicronutrientResult[] = keys.map(({ key, name, symbol }) => {
        const value = (input[key] as number | undefined) ?? 0
        const status = classifyMicronutrient(key as string, value)
        const cropDoses = DOSES[input.crop]
        const doseKgHa = cropDoses?.[key as string]?.[status] ?? 0
        const totalKg = doseKgHa * input.areaHa
        return { name, symbol, value, status, doseKgHa, totalKg }
    })

    return { nutrients }
}

export function validateMicronutrientCorrection(input: MicronutrientInput): string | null {
    if (!input.crop) return 'Selecione a cultura'
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área'
    if (input.zn === undefined && input.b === undefined && input.cu === undefined && input.mn === undefined)
        return 'Informe ao menos um micronutriente'
    return null
}
