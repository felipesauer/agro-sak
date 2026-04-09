// ── Pre-Harvest Yield Estimation ──

export interface SoybeanInput {
    crop: 'soybean'
    plantsPerMeter: number
    podsPerPlant: number
    grainsPerPod: number
    thousandGrainWeight: number
    rowSpacingM: number
}

export interface CornInput {
    crop: 'corn'
    earsPerMeter: number
    rowsPerEar: number
    grainsPerRow: number
    thousandGrainWeight: number
    rowSpacingM: number
}

export type PreHarvestYieldInput = SoybeanInput | CornInput

export interface PreHarvestYieldResult {
    yieldKgHa: number
    yieldScHa: number
    yieldLow: number
    yieldHigh: number
}

const BAG_WEIGHT_KG = 60

export function calculatePreHarvestYield(input: PreHarvestYieldInput): PreHarvestYieldResult {
    const { thousandGrainWeight, rowSpacingM } = input

    let yieldKgHa: number

    if (input.crop === 'soybean') {
        // plantsPerMeter / spacingM = plants/m²
        const plantsPerM2 = input.plantsPerMeter / rowSpacingM
        yieldKgHa = plantsPerM2 * input.podsPerPlant * input.grainsPerPod * (thousandGrainWeight / 1000)
    } else {
        const earsPerM2 = input.earsPerMeter / rowSpacingM
        yieldKgHa = earsPerM2 * input.rowsPerEar * input.grainsPerRow * (thousandGrainWeight / 1000)
    }

    const yieldScHa = yieldKgHa / BAG_WEIGHT_KG
    const yieldLow = yieldScHa * 0.9
    const yieldHigh = yieldScHa * 1.1

    return { yieldKgHa, yieldScHa, yieldLow, yieldHigh }
}

export function validatePreHarvestYield(input: PreHarvestYieldInput): string | null {
    if (!input.rowSpacingM || input.rowSpacingM <= 0) return 'Informe o espaçamento entre linhas'
    if (!input.thousandGrainWeight || input.thousandGrainWeight <= 0) return 'Informe o peso de mil grãos (PMG)'

    if (input.crop === 'soybean') {
        if (!input.plantsPerMeter || input.plantsPerMeter <= 0) return 'Informe as plantas por metro'
        if (!input.podsPerPlant || input.podsPerPlant <= 0) return 'Informe as vagens por planta'
        if (!input.grainsPerPod || input.grainsPerPod <= 0) return 'Informe os grãos por vagem'
    } else {
        if (!input.earsPerMeter || input.earsPerMeter <= 0) return 'Informe as espigas por metro'
        if (!input.rowsPerEar || input.rowsPerEar <= 0) return 'Informe as fileiras por espiga'
        if (!input.grainsPerRow || input.grainsPerRow <= 0) return 'Informe os grãos por fileira'
    }

    return null
}
