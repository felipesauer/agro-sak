// ── Crop Profit Simulator (3 scenarios) ──

export interface ScenarioConfig {
    label: string
    yieldScHa: number
    pricePerSc: number
    costPerHa: number
}

export interface ScenarioResult {
    label: string
    grossRevenue: number
    taxes: number
    netRevenue: number
    profit: number
    margin: number
    roi: number
    totalResult: number
}

export interface CropProfitInput {
    areaHa: number
    taxRate: number           // fraction, e.g. 0.015 for PF
    scenarios: ScenarioConfig[]
}

export interface CropProfitResult {
    scenarios: ScenarioResult[]
}

export function calculateCropProfit(input: CropProfitInput): CropProfitResult {
    const { areaHa, taxRate, scenarios: configs } = input

    const scenarios: ScenarioResult[] = configs.map(cfg => {
        const grossRevenue = cfg.yieldScHa * cfg.pricePerSc
        const taxes = grossRevenue * taxRate
        const netRevenue = grossRevenue - taxes
        const profit = netRevenue - cfg.costPerHa
        const margin = grossRevenue > 0 ? (profit / grossRevenue) * 100 : 0
        const roi = cfg.costPerHa > 0 ? (profit / cfg.costPerHa) * 100 : 0
        const totalResult = profit * areaHa

        return { label: cfg.label, grossRevenue, taxes, netRevenue, profit, margin, roi, totalResult }
    })

    return { scenarios }
}

export function validateCropProfit(input: CropProfitInput): string | null {
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área plantada'
    if (input.scenarios.length === 0) return 'Informe pelo menos um cenário'
    const realistic = input.scenarios.find(s => s.label === 'Realista')
    if (realistic && (!realistic.yieldScHa || !realistic.pricePerSc || !realistic.costPerHa))
        return 'Preencha pelo menos o cenário realista'
    return null
}
