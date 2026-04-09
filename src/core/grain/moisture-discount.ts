// ── Moisture & Impurity Discount ──

export interface MoistureDiscountInput {
    grossWeightKg: number
    moistureMeasured: number
    impurityMeasured: number
    damagedPercent: number
    pricePerBag: number
    moistureStandard: number
    impurityStandard: number
    bagWeightKg?: number
}

export interface MoistureDiscountResult {
    moistureStandard: number
    impurityStandard: number
    moistureDiscountKg: number
    impurityDiscountKg: number
    damagedDiscountKg: number
    netWeightKg: number
    netBags: number
    totalValue: number
    lossValue: number
}

export function calculateMoistureDiscount(input: MoistureDiscountInput): MoistureDiscountResult {
    const bagKg = input.bagWeightKg ?? 60
    const { grossWeightKg, moistureMeasured, impurityMeasured, damagedPercent, pricePerBag, moistureStandard, impurityStandard } = input

    const moistureFactor =
        moistureMeasured > moistureStandard
            ? (moistureMeasured - moistureStandard) / (100 - moistureStandard)
            : 0
    const moistureDiscountKg = grossWeightKg * moistureFactor

    const impurityFactor =
        impurityMeasured > impurityStandard
            ? (impurityMeasured - impurityStandard) / 100
            : 0
    const impurityDiscountKg = grossWeightKg * impurityFactor

    const damagedDiscountKg = grossWeightKg * (damagedPercent / 100)

    const netWeightKg = grossWeightKg - moistureDiscountKg - impurityDiscountKg - damagedDiscountKg
    const netBags = netWeightKg / bagKg
    const grossBags = grossWeightKg / bagKg

    const totalValue = netBags * pricePerBag
    const lossValue = (grossBags - netBags) * pricePerBag

    return {
        moistureStandard,
        impurityStandard,
        moistureDiscountKg,
        impurityDiscountKg,
        damagedDiscountKg,
        netWeightKg,
        netBags,
        totalValue,
        lossValue,
    }
}

export function validateMoistureDiscount(input: { grossWeightKg: number; moistureMeasured: number; impurityMeasured: number }): string | null {
    if (!input.grossWeightKg || input.grossWeightKg <= 0) return 'Informe o peso bruto da carga'
    if (input.moistureMeasured === undefined || isNaN(input.moistureMeasured)) return 'Informe a umidade medida'
    if (input.impurityMeasured === undefined || isNaN(input.impurityMeasured)) return 'Informe a impureza medida'
    return null
}
