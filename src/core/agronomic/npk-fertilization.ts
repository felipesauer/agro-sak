// ── NPK Fertilization ──

export const P_CLASSES: Record<string, { limits: number[]; labels: string[] }> = {
    clay: { limits: [3, 6, 9, 18], labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'] },
    medium: { limits: [6, 12, 18, 36], labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'] },
    sandy: { limits: [10, 20, 30, 60], labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'] },
}

export const K_CLASSES = {
    limits: [25, 50, 80, 120],
    labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'],
}

export const P_REC: Record<string, number[]> = {
    soybean: [120, 90, 60, 30, 0],
    corn:    [140, 100, 70, 40, 0],
    cotton:  [140, 110, 80, 40, 0],
    bean:    [120, 90, 60, 30, 0],
}

export const K_REC: Record<string, number[]> = {
    soybean: [120, 90, 60, 30, 0],
    corn:    [120, 80, 60, 30, 0],
    cotton:  [140, 100, 70, 40, 0],
    bean:    [100, 70, 50, 30, 0],
}

export const N_REC: Record<string, { inoculated: number; notInoculated: number }> = {
    soybean: { inoculated: 0, notInoculated: 20 },
    corn:    { inoculated: 120, notInoculated: 140 },
    cotton:  { inoculated: 120, notInoculated: 120 },
    bean:    { inoculated: 60, notInoculated: 80 },
}

export const NPK_FORMULAS = [
    { formula: '02-20-18', n: 2, p: 20, k: 18 },
    { formula: '04-14-08', n: 4, p: 14, k: 8 },
    { formula: '04-30-10', n: 4, p: 30, k: 10 },
    { formula: '05-25-15', n: 5, p: 25, k: 15 },
    { formula: '08-28-16', n: 8, p: 28, k: 16 },
    { formula: '10-10-10', n: 10, p: 10, k: 10 },
    { formula: '20-00-20', n: 20, p: 0, k: 20 },
    { formula: '20-05-20', n: 20, p: 5, k: 20 },
    { formula: '00-20-20', n: 0, p: 20, k: 20 },
]

export function classifyLevel(value: number, limits: number[]): number {
    for (let i = 0; i < limits.length; i++) {
        if (value < limits[i]) return i
    }
    return limits.length
}

export interface NpkFertilizationInput {
    crop: string          // 'soybean' | 'corn' | 'cotton' | 'bean' | 'custom'
    texture: string       // 'clay' | 'medium' | 'sandy'
    pSoil: number         // mg/dm³
    kSoil: number         // mg/dm³
    inoculated: boolean
    customN?: number
    customP?: number
    customK?: number
}

export interface FormulaMatch {
    formula: string
    kgPerHa: number
    bagsPerHa: number
    nSupplied: number
    pSupplied: number
    kSupplied: number
}

export interface NpkFertilizationResult {
    nRec: number
    pRec: number
    kRec: number
    pLevel: string
    kLevel: string
    formulas: FormulaMatch[]
}

export function calculateNpkFertilization(input: NpkFertilizationInput): NpkFertilizationResult {
    let nRec: number, pRec: number, kRec: number, pLevel: string, kLevel: string

    if (input.crop === 'custom') {
        nRec = input.customN ?? 0
        pRec = input.customP ?? 0
        kRec = input.customK ?? 0
        pLevel = 'Personalizado'
        kLevel = 'Personalizado'
    } else {
        const pClasses = P_CLASSES[input.texture] ?? P_CLASSES.clay
        const pLevelIdx = classifyLevel(input.pSoil, pClasses.limits)
        const kLevelIdx = classifyLevel(input.kSoil, K_CLASSES.limits)

        pLevel = pClasses.labels[pLevelIdx] ?? 'Muito alto'
        kLevel = K_CLASSES.labels[kLevelIdx] ?? 'Muito alto'

        const nRef = N_REC[input.crop] ?? N_REC.soybean
        nRec = input.inoculated ? nRef.inoculated : nRef.notInoculated

        const pRecTable = P_REC[input.crop] ?? P_REC.soybean
        const kRecTable = K_REC[input.crop] ?? K_REC.soybean
        pRec = pRecTable[pLevelIdx] ?? 0
        kRec = kRecTable[kLevelIdx] ?? 0
    }

    const scored = NPK_FORMULAS
        .filter(f => {
            if (nRec > 0 && pRec > 0 && kRec > 0) return true
            if (pRec > 0 && f.p > 0) return true
            if (kRec > 0 && f.k > 0) return true
            if (nRec > 0 && f.n > 0) return true
            return false
        })
        .map(f => {
            const kgByP = pRec > 0 && f.p > 0 ? (pRec / (f.p / 100)) : Infinity
            const kgByK = kRec > 0 && f.k > 0 ? (kRec / (f.k / 100)) : Infinity
            const kgPerHa = Math.min(
                Math.max(kgByP, kgByK) > 2000 ? 400 : Math.round(Math.min(kgByP, kgByK)),
                2000,
            )
            const nSupplied = kgPerHa * (f.n / 100)
            const pSupplied = kgPerHa * (f.p / 100)
            const kSupplied = kgPerHa * (f.k / 100)
            const pError = Math.abs(pSupplied - pRec)
            const kError = Math.abs(kSupplied - kRec)
            const score = pError + kError
            return { formula: f.formula, kgPerHa, bagsPerHa: kgPerHa / 50, nSupplied, pSupplied, kSupplied, score }
        })
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)

    return { nRec, pRec, kRec, pLevel, kLevel, formulas: scored.map(({ formula, kgPerHa, bagsPerHa, nSupplied, pSupplied, kSupplied }) => ({ formula, kgPerHa, bagsPerHa, nSupplied, pSupplied, kSupplied })) }
}

export function validateNpkFertilization(input: NpkFertilizationInput): string | null {
    if (input.crop === 'custom') {
        if (!input.customP && !input.customK && !input.customN) return 'Informe ao menos um nutriente alvo'
        return null
    }
    if (input.pSoil === undefined || input.pSoil === null) return 'Informe o fósforo (P) do laudo'
    if (input.kSoil === undefined || input.kSoil === null) return 'Informe o potássio (K) do laudo'
    return null
}
