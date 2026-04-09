// ── Harvest Loss ──

export const GRAINS_PER_SC: Record<string, number> = {
    soybean: 16,
    corn: 8,
    wheat: 20,
    rice: 14,
    bean: 12,
}

export interface LossDetail {
    label: string
    scHa: number
    costHa: number
}

export interface HarvestLossInput {
    grainsFactor: number      // grains/m² per sc/ha
    sacPrice: number
    expectedYieldScHa: number
    preHarvestGrains: number   // grains/m²
    platformGrains: number
    threshingGrains: number
    areaHa?: number
}

export interface HarvestLossResult {
    losses: LossDetail[]
    totalScHa: number
    totalCostHa: number
    totalCostArea: number | null
    percentLoss: number
    severity: 'success' | 'warning' | 'error'
}

export function calculateHarvestLoss(input: HarvestLossInput): HarvestLossResult {
    const { grainsFactor, sacPrice, expectedYieldScHa, areaHa } = input

    const stages = [
        { label: 'Pré-colheita (debulha natural)', grains: input.preHarvestGrains },
        { label: 'Plataforma de corte', grains: input.platformGrains },
        { label: 'Trilha e separação', grains: input.threshingGrains },
    ]

    const losses: LossDetail[] = stages.map((s) => {
        const scHa = s.grains / grainsFactor
        return { label: s.label, scHa, costHa: scHa * sacPrice }
    })

    const totalScHa = losses.reduce((sum, l) => sum + l.scHa, 0)
    const totalCostHa = totalScHa * sacPrice
    const totalCostArea = areaHa && areaHa > 0 ? totalCostHa * areaHa : null
    const percentLoss = expectedYieldScHa > 0 ? (totalScHa / expectedYieldScHa) * 100 : 0

    let severity: 'success' | 'warning' | 'error' = 'success'
    if (totalScHa > 2) severity = 'error'
    else if (totalScHa > 1) severity = 'warning'

    return { losses, totalScHa, totalCostHa, totalCostArea, percentLoss, severity }
}

export function validateHarvestLoss(input: HarvestLossInput): string | null {
    if (!input.expectedYieldScHa || input.expectedYieldScHa <= 0) return 'Informe a produtividade esperada'
    if (isNaN(input.preHarvestGrains)) return 'Informe os grãos/m² — pré-colheita'
    if (isNaN(input.platformGrains)) return 'Informe os grãos/m² — plataforma'
    if (isNaN(input.threshingGrains)) return 'Informe os grãos/m² — trilha'
    if (!input.sacPrice || input.sacPrice <= 0) return 'Informe o preço da saca'
    return null
}
