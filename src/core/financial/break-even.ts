// ── Break-Even domain logic (pure — zero React) ──

export type BreakEvenMode = 'yield' | 'price'

export interface BreakEvenInput {
    mode: BreakEvenMode
    costPerHa: number
    sacPrice: number       // R$/sc — required for yield mode
    expectedYield: number  // sc/ha — required for price mode
}

export interface BreakEvenResult {
    breakEvenYield: number | null
    breakEvenPrice: number | null
    safetyMargin: number | null
}

/**
  * Break-even by yield:  sc/ha = Cost (R$/ha) / Price (R$/sc)
  * Break-even by price:  R$/sc = Cost (R$/ha) / Yield (sc/ha)
  */
export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
    let breakEvenYield: number | null = null
    let breakEvenPrice: number | null = null
    let safetyMargin: number | null = null

    if (input.mode === 'yield' && input.sacPrice > 0) {
        breakEvenYield = input.costPerHa / input.sacPrice
        if (input.expectedYield > 0) {
            safetyMargin = ((input.expectedYield - breakEvenYield) / input.expectedYield) * 100
        }
    }

    if (input.mode === 'price' && input.expectedYield > 0) {
        breakEvenPrice = input.costPerHa / input.expectedYield
        if (input.sacPrice > 0) {
            safetyMargin = ((input.sacPrice - breakEvenPrice) / input.sacPrice) * 100
        }
    }

    return { breakEvenYield, breakEvenPrice, safetyMargin }
}

export function validateBreakEven(input: BreakEvenInput): string | null {
    if (input.costPerHa <= 0) return 'Informe o custo total por hectare'
    if (input.mode === 'yield' && input.sacPrice <= 0) return 'Informe o preço de venda da saca'
    if (input.mode === 'price' && input.expectedYield <= 0) return 'Informe a produtividade esperada'
    return null
}
