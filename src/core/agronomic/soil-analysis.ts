// ── Soil Analysis Interpretation ──

export interface SoilNutrientClassification {
    label: string
    color: string
}

export interface SoilAnalysisInput {
    pH?: number
    organicMatter?: number    // g/dm³
    P?: number                // mg/dm³
    K?: number                // mmolc/dm³
    Ca?: number               // mmolc/dm³
    Mg?: number               // mmolc/dm³
    hAl?: number              // mmolc/dm³
    S?: number                // mg/dm³
    B?: number                // mg/dm³
    Cu?: number               // mg/dm³
    Mn?: number               // mg/dm³
    Zn?: number               // mg/dm³
}

export interface NutrientResultRow {
    name: string
    value: number
    unit: string
    label: string
    color: string
}

export interface SoilAnalysisResult {
    nutrients: NutrientResultRow[]
    ctc: number
    baseSaturation: number
    alSaturation: number
    caMgRatio: number
    caKRatio: number
    mgKRatio: number
    warningCount: number
    criticalCount: number
}

// Classifier function type — injected so core doesn't depend on data/
export type SoilNutrientClassifier = (nutrient: string, value: number) => SoilNutrientClassification | null

const NUTRIENT_DISPLAY: Record<string, { name: string; unit: string }> = {
    pH: { name: 'pH (CaCl₂)', unit: '' },
    organicMatter: { name: 'Matéria Orgânica', unit: 'g/dm³' },
    P: { name: 'Fósforo (P)', unit: 'mg/dm³' },
    K: { name: 'Potássio (K)', unit: 'mmolc/dm³' },
    Ca: { name: 'Cálcio (Ca)', unit: 'mmolc/dm³' },
    Mg: { name: 'Magnésio (Mg)', unit: 'mmolc/dm³' },
    S: { name: 'Enxofre (S)', unit: 'mg/dm³' },
    B: { name: 'Boro (B)', unit: 'mg/dm³' },
    Cu: { name: 'Cobre (Cu)', unit: 'mg/dm³' },
    Mn: { name: 'Manganês (Mn)', unit: 'mg/dm³' },
    Zn: { name: 'Zinco (Zn)', unit: 'mg/dm³' },
}

export function calculateSoilAnalysis(
    input: SoilAnalysisInput,
    classify: SoilNutrientClassifier,
): SoilAnalysisResult {
    const nutrients: NutrientResultRow[] = []
    let warningCount = 0
    let criticalCount = 0

    for (const [key, meta] of Object.entries(NUTRIENT_DISPLAY)) {
        const value = input[key as keyof SoilAnalysisInput]
        if (value === undefined || value === null) continue
        const classification = classify(key, value)
        if (!classification) continue

        nutrients.push({ name: meta.name, value, unit: meta.unit, label: classification.label, color: classification.color })

        if (classification.color === 'amber' || classification.color === 'yellow') warningCount++
        if (classification.color === 'red') criticalCount++
    }

    const Ca = input.Ca ?? 0
    const Mg = input.Mg ?? 0
    const K = input.K ?? 0
    const hAl = input.hAl ?? 0

    const sumBases = Ca + Mg + K
    const ctc = sumBases + hAl
    const baseSaturation = ctc > 0 ? (sumBases / ctc) * 100 : 0
    const alSaturation = ctc > 0 ? (hAl / ctc) * 100 : 0

    const caMgRatio = Mg > 0 ? Ca / Mg : 0
    const caKRatio = K > 0 ? Ca / K : 0
    const mgKRatio = K > 0 ? Mg / K : 0

    return { nutrients, ctc, baseSaturation, alSaturation, caMgRatio, caKRatio, mgKRatio, warningCount, criticalCount }
}

export function validateSoilAnalysis(input: SoilAnalysisInput): string | null {
    const values = Object.values(input).filter(v => v !== undefined && v !== null)
    if (values.length < 3) return 'Preencha pelo menos 3 parâmetros da análise de solo'
    for (const [key, value] of Object.entries(input)) {
        if (value === undefined || value === null) continue
        if (value < 0) return `Valor inválido para ${NUTRIENT_DISPLAY[key]?.name ?? key}`
    }
    return null
}
