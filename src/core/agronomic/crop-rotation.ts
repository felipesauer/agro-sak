// ── Crop Rotation ──

export interface CropRotationInput {
    system: 'soy_corn' | 'soy_wheat' | 'soy_only'
    soybeanYield: number     // sc/ha (base, without bonus)
    soybeanPrice: number     // R$/sc
    soybeanCost: number      // R$/ha
    rotationBonusPercent: number  // typically 8
    secondCropYield?: number // sc/ha
    secondCropPrice?: number // R$/sc
    secondCropCost?: number  // R$/ha
}

export interface CropRow {
    crop: string
    yield: number
    revenue: number
    cost: number
    profit: number
    margin: number
}

export interface CropRotationResult {
    rows: CropRow[]
    annualProfit: number
    profitVsMonoculture: number
    rotationBenefit: number  // fraction, e.g. 0.08
}

export function calculateCropRotation(input: CropRotationInput): CropRotationResult {
    const isRotation = input.system !== 'soy_only'
    const rotationBenefit = isRotation ? input.rotationBonusPercent / 100 : 0

    const sy = input.soybeanYield * (1 + rotationBenefit)
    const soyRevenue = sy * input.soybeanPrice
    const soyProfit = soyRevenue - input.soybeanCost
    const soyMargin = soyRevenue > 0 ? (soyProfit / soyRevenue) * 100 : 0

    const rows: CropRow[] = [
        { crop: isRotation ? 'Soja (com bônus rotação)' : 'Soja', yield: sy, revenue: soyRevenue, cost: input.soybeanCost, profit: soyProfit, margin: soyMargin },
    ]

    let annualProfit = soyProfit

    if (isRotation && input.secondCropYield && input.secondCropPrice !== undefined && input.secondCropCost !== undefined) {
        const secondRevenue = input.secondCropYield * input.secondCropPrice
        const secondProfit = secondRevenue - input.secondCropCost
        const secondMargin = secondRevenue > 0 ? (secondProfit / secondRevenue) * 100 : 0
        const label = input.system === 'soy_wheat' ? 'Trigo' : 'Milho safrinha'

        rows.push({ crop: label, yield: input.secondCropYield, revenue: secondRevenue, cost: input.secondCropCost, profit: secondProfit, margin: secondMargin })
        annualProfit += secondProfit
    }

    const monocultureProfit = input.soybeanYield * input.soybeanPrice - input.soybeanCost
    const profitVsMonoculture = annualProfit - monocultureProfit

    return { rows, annualProfit, profitVsMonoculture, rotationBenefit }
}

export function validateCropRotation(input: CropRotationInput): string | null {
    if (!input.soybeanYield || input.soybeanYield <= 0) return 'Informe a produtividade da soja'
    if (!input.soybeanPrice || input.soybeanPrice <= 0) return 'Informe o preço da saca de soja'
    if (input.soybeanCost < 0) return 'Informe o custo de produção da soja'
    if (input.system !== 'soy_only') {
        if (!input.secondCropYield || input.secondCropYield <= 0) return 'Informe a produtividade da segunda cultura'
        if (!input.secondCropPrice || input.secondCropPrice <= 0) return 'Informe o preço da segunda cultura'
        if (input.secondCropCost === undefined || input.secondCropCost < 0) return 'Informe o custo da segunda cultura'
    }
    return null
}
