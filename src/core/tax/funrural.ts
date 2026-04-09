// ── Funrural domain logic (pure — zero React) ──

export interface FunruralInput {
    producerType: 'pf' | 'pj'
    grossRevenue: number
    period: 'monthly' | 'annual'
}

export interface FunruralResult {
    funrural: number
    rat: number
    senar: number
    total: number
    annualProjection: number | null
}

export const FUNRURAL_RATE_TABLE = {
    pf: { funrural: 1.2, rat: 0.1, senar: 0.2 },
    pj: { funrural: 2.5, rat: 0.1, senar: 0.25 },
} as const

export function calculateFunrural(input: FunruralInput): FunruralResult {
    const rates = FUNRURAL_RATE_TABLE[input.producerType]
    const funrural = input.grossRevenue * (rates.funrural / 100)
    const rat = input.grossRevenue * (rates.rat / 100)
    const senar = input.grossRevenue * (rates.senar / 100)
    const total = funrural + rat + senar
    const annualProjection = input.period === 'monthly' ? total * 12 : null

    return { funrural, rat, senar, total, annualProjection }
}

export function validateFunrural(input: FunruralInput): string | null {
    if (input.grossRevenue <= 0) return 'Informe a receita bruta'
    return null
}

/** Total rate for a given producer type */
export function funruralTotalRate(producerType: 'pf' | 'pj'): number {
    const r = FUNRURAL_RATE_TABLE[producerType]
    return r.funrural + r.rat + r.senar
}
