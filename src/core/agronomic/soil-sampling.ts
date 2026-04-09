// ── Soil Sampling ──

export type SamplingMethod = 'conventional' | 'grid' | 'precision'

export const SAMPLING_RATES: Record<SamplingMethod, { minHa: number; maxHa: number; subSamples: number }> = {
    conventional: { minHa: 10, maxHa: 20, subSamples: 15 },
    grid: { minHa: 2, maxHa: 5, subSamples: 10 },
    precision: { minHa: 1, maxHa: 2, subSamples: 8 },
}

export interface SoilSamplingInput {
    areaHa: number
    samplingMethod: SamplingMethod
    managementZones: number
    costPerSample: number
    depthLayers: number
}

export interface SoilSamplingResult {
    totalSamples: number
    samplesPerZone: number
    subSamplesPerComposite: number
    gridSpacing: number       // meters
    totalCost: number
    costPerHa: number
    walkingDistanceKm: number
}

export function calculateSoilSampling(input: SoilSamplingInput): SoilSamplingResult | null {
    const { areaHa, samplingMethod, managementZones, costPerSample, depthLayers } = input
    const rate = SAMPLING_RATES[samplingMethod]
    if (!rate) return null

    const avgHaPerSample = (rate.minHa + rate.maxHa) / 2
    const areaPerZone = areaHa / managementZones
    const samplesPerZone = Math.max(1, Math.ceil(areaPerZone / avgHaPerSample))
    const totalSamples = samplesPerZone * managementZones * depthLayers

    const gridSpacing = Math.sqrt(avgHaPerSample * 10_000)

    const totalCost = totalSamples * costPerSample
    const costPerHa = totalCost / areaHa

    const walkingDistanceKm = (samplesPerZone * managementZones * gridSpacing * 1.4) / 1000

    return { totalSamples, samplesPerZone, subSamplesPerComposite: rate.subSamples, gridSpacing, totalCost, costPerHa, walkingDistanceKm }
}

export function validateSoilSampling(input: SoilSamplingInput): string | null {
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área total'
    if (input.areaHa > 100_000) return 'Área muito grande — verifique o valor'
    if (!input.managementZones || input.managementZones < 1 || input.managementZones > 50) return 'Zonas de manejo deve ser entre 1 e 50'
    if (input.costPerSample < 0) return 'Custo por amostra deve ser positivo'
    return null
}
