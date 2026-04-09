// ── Grain Classification (IN MAPA) ──

export interface CropLimits {
    moisture: number
    impurities: number
    broken: number[]       // [Type1, Type2, Type3]
    greenDamaged: number[]
    burned: number[]
    baseMoisture: number
    baseImpurities: number
}

export const CLASSIFICATION_LIMITS: Record<string, CropLimits> = {
    soybean: {
        moisture: 14,
        impurities: 1,
        broken: [8, 15, 30],
        greenDamaged: [8, 15, 30],
        burned: [1, 2, 5],
        baseMoisture: 14,
        baseImpurities: 1,
    },
    corn: {
        moisture: 14,
        impurities: 1,
        broken: [3, 6, 15],
        greenDamaged: [6, 10, 20],
        burned: [0.5, 1, 3],
        baseMoisture: 14,
        baseImpurities: 1,
    },
}

export interface GrainClassificationInput {
    crop: string
    moisture: number
    impurities: number
    broken: number
    greenDamaged: number
    burned: number
}

export interface DefectRow {
    defect: string
    measured: number
    limit: number
    status: string
}

export interface GrainClassificationResult {
    type: number
    typeName: string
    approved: boolean
    discountMoisture: number
    discountImpurities: number
    totalDiscount: number
    defects: DefectRow[]
    alerts: string[]
}

export function calculateGrainClassification(input: GrainClassificationInput): GrainClassificationResult | null {
    const limits = CLASSIFICATION_LIMITS[input.crop]
    if (!limits) return null

    const { moisture, impurities, broken, greenDamaged, burned } = input

    let type = 0
    for (let t = 0; t < 3; t++) {
        if (broken <= limits.broken[t] && greenDamaged <= limits.greenDamaged[t] && burned <= limits.burned[t]) {
            type = t + 1
            break
        }
    }

    const approved = type > 0
    const typeName = approved ? `Tipo ${type}` : 'Fora de padrão'

    const discountMoisture = moisture > limits.baseMoisture
        ? (moisture - limits.baseMoisture) * 1.5
        : 0
    const discountImpurities = impurities > limits.baseImpurities
        ? (impurities - limits.baseImpurities) * 1.0
        : 0
    const totalDiscount = discountMoisture + discountImpurities

    const defects: DefectRow[] = [
        {
            defect: 'Umidade',
            measured: moisture,
            limit: limits.baseMoisture,
            status: moisture <= limits.baseMoisture ? '✓ OK' : `↑ Desc. ${discountMoisture.toFixed(1)}%`,
        },
        {
            defect: 'Impurezas',
            measured: impurities,
            limit: limits.baseImpurities,
            status: impurities <= limits.baseImpurities ? '✓ OK' : `↑ Desc. ${discountImpurities.toFixed(1)}%`,
        },
        {
            defect: 'Quebrados/Amassados',
            measured: broken,
            limit: type > 0 ? limits.broken[type - 1] : limits.broken[2],
            status: type > 0 && broken <= limits.broken[type - 1] ? '✓ OK' : '✗ Excede',
        },
        {
            defect: 'Avariados/Verdes',
            measured: greenDamaged,
            limit: type > 0 ? limits.greenDamaged[type - 1] : limits.greenDamaged[2],
            status: type > 0 && greenDamaged <= limits.greenDamaged[type - 1] ? '✓ OK' : '✗ Excede',
        },
        {
            defect: 'Ardidos/Queimados',
            measured: burned,
            limit: type > 0 ? limits.burned[type - 1] : limits.burned[2],
            status: type > 0 && burned <= limits.burned[type - 1] ? '✓ OK' : '✗ Excede',
        },
    ]

    const alerts: string[] = []
    if (!approved) alerts.push('Lote fora de padrão comercial — pode sofrer deságio significativo ou recusa.')
    if (moisture > 18) alerts.push('Umidade muito alta (> 18%). Secagem urgente recomendada antes de armazenar ou comercializar.')
    if (burned > limits.burned[0]) alerts.push('Teor de grãos ardidos/queimados acima do Tipo 1. Segregue lotes na colheita.')

    return { type, typeName, approved, discountMoisture, discountImpurities, totalDiscount, defects, alerts }
}

export function validateGrainClassification(input: GrainClassificationInput): string | null {
    if (isNaN(input.moisture)) return 'Informe a umidade do lote'
    if (isNaN(input.impurities)) return 'Informe o percentual de impurezas'
    if (isNaN(input.broken)) return 'Informe o percentual de quebrados/amassados'
    if (isNaN(input.greenDamaged)) return 'Informe o percentual de avariados/verdes'
    if (isNaN(input.burned)) return 'Informe o percentual de ardidos/queimados'
    if (input.moisture < 0 || input.moisture > 40) return 'Umidade deve estar entre 0 e 40%'
    return null
}
