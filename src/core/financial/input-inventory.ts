// ── Input Inventory ──

export interface InputItemSpec {
    name: string
    ratePerHa: number
    pricePerUnit: number
    unitLabel: string
    priceIsTon?: boolean       // if true, price is per ton (divide by 1000 for kg)
}

export interface InputItemResult {
    name: string
    qty: number
    unit: string
    cost: number
}

export interface InputInventoryInput {
    areaHa: number
    items: InputItemSpec[]
    safetyMarginPercent: number
}

export interface InputInventoryResult {
    items: InputItemResult[]
    subtotal: number
    marginValue: number
    grandTotal: number
}

export function calculateInputInventory(input: InputInventoryInput): InputInventoryResult {
    const { areaHa, items, safetyMarginPercent } = input

    const results: InputItemResult[] = items
        .filter(i => i.ratePerHa > 0)
        .map(i => {
            const qty = i.ratePerHa * areaHa
            const unitPrice = i.priceIsTon ? i.pricePerUnit / 1000 : i.pricePerUnit
            const cost = qty * unitPrice
            return { name: i.name, qty, unit: i.unitLabel, cost }
        })

    const subtotal = results.reduce((sum, i) => sum + i.cost, 0)
    const marginValue = subtotal * (safetyMarginPercent / 100)
    const grandTotal = subtotal + marginValue

    return { items: results, subtotal, marginValue, grandTotal }
}

export function validateInputInventory(input: InputInventoryInput): string | null {
    if (!input.areaHa || input.areaHa <= 0) return 'Informe a área'
    const hasAny = input.items.some(i => i.ratePerHa > 0)
    if (!hasAny) return 'Informe ao menos um insumo'
    return null
}
