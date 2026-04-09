// ── Silo Dimensioning ──

export interface GrainDensity {
    density: number  // t/m³
    label: string
    bagKg: number
}

export const GRAIN_DENSITY: Record<string, GrainDensity> = {
    soybean: { density: 0.72, label: 'Soja', bagKg: 60 },
    corn: { density: 0.73, label: 'Milho', bagKg: 60 },
    wheat: { density: 0.78, label: 'Trigo', bagKg: 60 },
    rice: { density: 0.58, label: 'Arroz', bagKg: 50 },
    sorghum: { density: 0.72, label: 'Sorgo', bagKg: 60 },
    cotton_seed: { density: 0.40, label: 'Caroço de algodão', bagKg: 60 },
    coffee: { density: 0.40, label: 'Café beneficiado', bagKg: 60 },
    bean: { density: 0.78, label: 'Feijão', bagKg: 60 },
}

export const FILL_FACTOR = 0.90
export const BAG_DIAMETER_M = 2.74
export const BAG_CROSS_SECTION_M2 = Math.PI * (BAG_DIAMETER_M / 2) ** 2 * 0.85

export type SiloType = 'cylindrical' | 'rectangular' | 'bag'

export interface SiloDimensioningInput {
    type: SiloType
    diameterM?: number
    heightM?: number
    lengthM?: number
    widthM?: number
    grainType: string
}

export interface SiloDimensioningResult {
    volumeM3: number
    capacityTonnes: number
    capacityBags: number
    fillPercent: number
    alerts: string[]
}

export function calculateSiloDimensioning(input: SiloDimensioningInput): SiloDimensioningResult {
    const grain = GRAIN_DENSITY[input.grainType] ?? GRAIN_DENSITY.soybean
    const alerts: string[] = []
    let volumeGross = 0

    if (input.type === 'cylindrical') {
        const r = (input.diameterM ?? 0) / 2
        const h = input.heightM ?? 0
        volumeGross = Math.PI * r ** 2 * h
    } else if (input.type === 'rectangular') {
        volumeGross = (input.lengthM ?? 0) * (input.widthM ?? 0) * (input.heightM ?? 0)
    } else {
        volumeGross = BAG_CROSS_SECTION_M2 * (input.lengthM ?? 0)
    }

    const volumeM3 = volumeGross * FILL_FACTOR
    const capacityTonnes = volumeM3 * grain.density
    const capacityBags = (capacityTonnes * 1000) / grain.bagKg
    const fillPercent = FILL_FACTOR * 100

    if (input.type === 'bag') {
        alerts.push(`Silo bolsa padrão 9 pés (${BAG_DIAMETER_M.toFixed(2)} m). O preenchimento real depende da compactação da ensacadora.`)
    }
    if (capacityTonnes > 5000) {
        alerts.push('Capacidade acima de 5.000 t. Para grandes unidades armazenadoras, considere projeto estrutural completo.')
    }

    return { volumeM3, capacityTonnes, capacityBags, fillPercent, alerts }
}

export function validateSiloDimensioning(input: SiloDimensioningInput): string | null {
    if (input.type === 'cylindrical') {
        if (!input.diameterM || input.diameterM <= 0) return 'Informe o diâmetro do silo'
        if (!input.heightM || input.heightM <= 0) return 'Informe a altura útil do silo'
        if (input.diameterM > 50) return 'Diâmetro acima de 50 m — verifique o valor'
        if (input.heightM > 40) return 'Altura acima de 40 m — verifique o valor'
    } else if (input.type === 'rectangular') {
        if (!input.lengthM || input.lengthM <= 0) return 'Informe o comprimento'
        if (!input.widthM || input.widthM <= 0) return 'Informe a largura'
        if (!input.heightM || input.heightM <= 0) return 'Informe a altura útil'
    } else if (input.type === 'bag') {
        if (!input.lengthM || input.lengthM <= 0) return 'Informe o comprimento da bolsa'
    }
    return null
}
