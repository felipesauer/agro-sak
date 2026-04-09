// ── Crop Simulator ──

export interface CropSimulatorInput {
    productionCost: number
    areaHa: number
    priceMin: number
    priceMax: number
    prodMin: number
    prodMax: number
    funruralPercent: number
}

export interface Scenario {
    label: string
    price: number
    productivity: number
    revenue: number
    totalCost: number
    profit: number
    profitPerHa: number
    roi: number
}

export interface HeatCell {
    price: number
    productivity: number
    profit: number
}

export interface CropSimulatorResult {
    scenarios: Scenario[]
    heatmap: HeatCell[][]
    priceSteps: number[]
    prodSteps: number[]
    breakEvenProd: number
}

const STEPS = 7

export function calculateCropSimulator(input: CropSimulatorInput): CropSimulatorResult | null {
    const { productionCost, areaHa, priceMin, priceMax, prodMin, prodMax, funruralPercent } = input
    if (areaHa <= 0 || productionCost <= 0) return null

    const funruralRate = funruralPercent / 100
    const totalCost = productionCost * areaHa

    const priceSteps: number[] = []
    const prodSteps: number[] = []
    for (let i = 0; i < STEPS; i++) {
        priceSteps.push(priceMin + (priceMax - priceMin) * (i / (STEPS - 1)))
        prodSteps.push(prodMin + (prodMax - prodMin) * (i / (STEPS - 1)))
    }

    const heatmap: HeatCell[][] = prodSteps.map((prod) =>
        priceSteps.map((price) => {
            const grossRevenue = areaHa * prod * price
            const funruralCost = grossRevenue * funruralRate
            const profit = grossRevenue - funruralCost - totalCost
            return { price, productivity: prod, profit }
        })
    )

    const scenarioConfigs = [
        { label: 'Pessimista', priceIdx: 1, prodIdx: 1 },
        { label: 'Base', priceIdx: Math.floor(STEPS / 2), prodIdx: Math.floor(STEPS / 2) },
        { label: 'Otimista', priceIdx: STEPS - 2, prodIdx: STEPS - 2 },
    ]

    const scenarios: Scenario[] = scenarioConfigs.map(({ label, priceIdx, prodIdx }) => {
        const price = priceSteps[priceIdx]
        const prod = prodSteps[prodIdx]
        const grossRevenue = areaHa * prod * price
        const funruralCost = grossRevenue * funruralRate
        const revenue = grossRevenue - funruralCost
        const profit = revenue - totalCost
        return {
            label,
            price,
            productivity: prod,
            revenue,
            totalCost,
            profit,
            profitPerHa: profit / areaHa,
            roi: (profit / totalCost) * 100,
        }
    })

    const midPrice = priceSteps[Math.floor(STEPS / 2)]
    const breakEvenProd = productionCost / (midPrice * (1 - funruralRate))

    return { scenarios, heatmap, priceSteps, prodSteps, breakEvenProd }
}

export function validateCropSimulator(input: CropSimulatorInput): string | null {
    if (!input.productionCost || input.productionCost <= 0) return 'Informe o custo de produção'
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área'
    if (!input.priceMin || !input.priceMax || input.priceMin <= 0 || input.priceMax <= 0) return 'Informe o range de preço'
    if (!input.prodMin || !input.prodMax || input.prodMin <= 0 || input.prodMax <= 0) return 'Informe o range de produtividade'
    if (input.priceMin >= input.priceMax) return 'Preço mínimo deve ser menor que o máximo'
    if (input.prodMin >= input.prodMax) return 'Produtividade mínima deve ser menor que a máxima'
    return null
}
