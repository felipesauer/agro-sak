// ── Software ROI ──

export interface SoftwareRoiInput {
    areaHa: number
    crop: string
    management: string
    softwareCostMonth: number
    customInputCost?: number
    customProd?: number
    customPrice?: number
}

export interface SavingsRow {
    label: string
    annual: number
}

export interface SoftwareRoiResult {
    savings: SavingsRow[]
    totalAnnual: number
    softwareAnnual: number
    roi: number
    paybackMonths: number
}

const INPUT_COST: Record<string, number> = {
    soybean: 2800,
    corn: 2400,
    cotton: 5500,
    mixed: 2600,
}

const AVG_PROD: Record<string, number> = {
    soybean: 55,
    corn: 100,
    cotton: 280,
    mixed: 55,
}

const AVG_PRICE: Record<string, number> = {
    soybean: 110,
    corn: 50,
    cotton: 120,
    mixed: 110,
}

export function calculateSoftwareRoi(input: SoftwareRoiInput): SoftwareRoiResult | null {
    const { areaHa, crop, management, softwareCostMonth, customInputCost, customProd, customPrice } = input
    if (areaHa <= 0) return null

    const inputCost = (crop === 'custom'
        ? (customInputCost ?? 2800)
        : (INPUT_COST[crop] ?? 2800)) * areaHa
    const prod = crop === 'custom'
        ? (customProd ?? 55)
        : (AVG_PROD[crop] ?? 55)
    const price = crop === 'custom'
        ? (customPrice ?? 110)
        : (AVG_PRICE[crop] ?? 110)

    const mgmtFactor = management === 'memory' ? 1.0 : management === 'spreadsheet' ? 0.7 : 0.4

    const inputSaving = inputCost * 0.015
    const salesGain = areaHa * prod * 3
    const harvestSaving = areaHa * 0.7 * price
    const timeSaving = 10 * 12 * 100
    const fiscalSaving = 8000

    const savings: SavingsRow[] = [
        { label: 'Redução de perdas em insumos (1,5%)', annual: inputSaving * mgmtFactor },
        { label: 'Melhor timing de venda (R$3/sc)', annual: salesGain * mgmtFactor },
        { label: 'Redução de perdas na colheita (0,7 sc/ha)', annual: harvestSaving * mgmtFactor },
        { label: 'Economia de tempo de gestão (10h/mês)', annual: timeSaving * mgmtFactor },
        { label: 'Redução de erros fiscais', annual: fiscalSaving * mgmtFactor },
    ]

    const totalAnnual = savings.reduce((s, r) => s + r.annual, 0)
    const softwareAnnual = softwareCostMonth * 12
    const roi = softwareAnnual > 0 ? ((totalAnnual - softwareAnnual) / softwareAnnual) * 100 : 0
    const paybackMonths = totalAnnual > 0 ? softwareAnnual / (totalAnnual / 12) : 0

    return { savings, totalAnnual, softwareAnnual, roi, paybackMonths }
}

export function validateSoftwareRoi(input: SoftwareRoiInput): string | null {
    if (!input.areaHa || input.areaHa <= 0) return 'Área deve ser positiva'
    if (!input.softwareCostMonth || input.softwareCostMonth <= 0) return 'Informe o custo mensal do software'
    return null
}
