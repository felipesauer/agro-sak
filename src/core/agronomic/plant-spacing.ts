// ── Plant Spacing ──

export interface PlantSpacingFromSpacingInput {
    mode: 'fromSpacing'
    rowSpacingCm: number
    plantSpacingCm: number
}

export interface PlantSpacingFromPopulationInput {
    mode: 'fromPopulation'
    rowSpacingCm: number
    population: number  // pl/ha
}

export type PlantSpacingInput = PlantSpacingFromSpacingInput | PlantSpacingFromPopulationInput

export interface PlantSpacingResult {
    plantsPerHa: number
    plantsPerMeter: number
    areaPerPlantM2: number
    plantSpacingCm: number
}

export function calculatePlantSpacing(input: PlantSpacingInput): PlantSpacingResult {
    const rowM = input.rowSpacingCm / 100

    if (input.mode === 'fromSpacing') {
        const plantM = input.plantSpacingCm / 100
        const plantsPerHa = 10_000 / (rowM * plantM)
        const plantsPerMeter = 1 / plantM
        const areaPerPlantM2 = rowM * plantM
        return { plantsPerHa, plantsPerMeter, areaPerPlantM2, plantSpacingCm: input.plantSpacingCm }
    }

    // fromPopulation
    const plantsPerMeter = input.population * rowM / 10_000
    const plantM = 1 / plantsPerMeter
    const areaPerPlantM2 = rowM * plantM
    return { plantsPerHa: input.population, plantsPerMeter, areaPerPlantM2, plantSpacingCm: plantM * 100 }
}

export function validatePlantSpacing(input: PlantSpacingInput): string | null {
    if (!input.rowSpacingCm || input.rowSpacingCm <= 0) return 'Informe o espaçamento entre linhas'
    if (input.mode === 'fromSpacing') {
        if (!input.plantSpacingCm || input.plantSpacingCm <= 0) return 'Informe o espaçamento entre plantas'
    } else {
        if (!input.population || input.population <= 0) return 'Informe a população desejada'
    }
    return null
}
