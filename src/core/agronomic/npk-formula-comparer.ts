// ── NPK Formula Comparer ──

export interface FormulaEntry {
    n: number   // % N
    p: number   // % P₂O₅
    k: number   // % K₂O
    pricePerBag50kg: number
    supplier?: string
}

export interface FormulaCompareResult {
    formula: string
    supplier: string
    totalPercent: number
    costPerKgN: number | null
    costPerKgP: number | null
    costPerKgK: number | null
    costPerPoint: number
    isBest: boolean
}

export function calculateNpkFormulaComparison(entries: FormulaEntry[]): FormulaCompareResult[] | null {
    if (entries.length < 2) return null

    const results: FormulaCompareResult[] = entries.map(e => {
        const totalPercent = e.n + e.p + e.k
        const pricePerKg = e.pricePerBag50kg / 50

        return {
            formula: `${String(e.n).padStart(2, '0')}-${String(e.p).padStart(2, '0')}-${String(e.k).padStart(2, '0')}`,
            supplier: e.supplier || '—',
            totalPercent,
            costPerKgN: e.n > 0 ? pricePerKg / (e.n / 100) : null,
            costPerKgP: e.p > 0 ? pricePerKg / (e.p / 100) : null,
            costPerKgK: e.k > 0 ? pricePerKg / (e.k / 100) : null,
            costPerPoint: e.pricePerBag50kg / (50 * (totalPercent / 100)),
            isBest: false,
        }
    })

    let minCost = Infinity
    let bestIdx = 0
    results.forEach((f, i) => {
        if (f.costPerPoint < minCost) {
            minCost = f.costPerPoint
            bestIdx = i
        }
    })
    results[bestIdx].isBest = true

    return results
}

export function validateNpkFormulaEntries(entries: FormulaEntry[]): string | null {
    if (entries.length < 2) return 'Preencha pelo menos 2 formulações para comparar'
    for (const e of entries) {
        const total = e.n + e.p + e.k
        if (total > 100) return `N + P₂O₅ + K₂O não pode ultrapassar 100% (formulação com ${total}%)`
        if (e.pricePerBag50kg <= 0) return 'Informe o preço de todas as formulações'
    }
    return null
}
