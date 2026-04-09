// ── Fertilizer Blend ──

export interface FertilizerSource {
    name: string
    n: number       // % of nutrient
    p2o5: number
    k2o: number
    s: number
    pricePerTon: number
}

export interface BlendSourceInput {
    source: FertilizerSource
    customPrice?: number
}

export interface BlendTargets {
    n: number    // kg/ha
    p: number    // kg/ha P₂O₅
    k: number    // kg/ha K₂O
}

export interface SourceResult {
    name: string
    kgPerHa: number
    kgTotal: number
    costPerHa: number
    costTotal: number
    nDelivered: number
    pDelivered: number
    kDelivered: number
    sDelivered: number
}

export interface FertilizerBlendResult {
    sources: SourceResult[]
    totalCostPerHa: number
    totalCostTotal: number
    totalKgPerHa: number
    nTotal: number
    pTotal: number
    kTotal: number
    sTotal: number
    nExcess: number
    pExcess: number
    kExcess: number
}

export function solveBlend(
    targets: BlendTargets,
    selectedSources: BlendSourceInput[],
): SourceResult[] {
    let remainN = targets.n
    let remainP = targets.p
    let remainK = targets.k

    const results: SourceResult[] = []

    const sorted = [...selectedSources].sort((a, b) => {
        const aPriority = (a.source.p2o5 > 0 ? remainP : 0) + (a.source.k2o > 0 ? remainK : 0) + (a.source.n > 0 ? remainN : 0)
        const bPriority = (b.source.p2o5 > 0 ? remainP : 0) + (b.source.k2o > 0 ? remainK : 0) + (b.source.n > 0 ? remainN : 0)
        const aMax = Math.max(a.source.p2o5, a.source.k2o, a.source.n)
        const bMax = Math.max(b.source.p2o5, b.source.k2o, b.source.n)
        return bPriority - aPriority || bMax - aMax
    })

    for (const { source, customPrice } of sorted) {
        const price = customPrice ?? source.pricePerTon
        let kgPerHa = 0

        if (source.p2o5 > 0 && remainP > 0)
            kgPerHa = Math.max(kgPerHa, (remainP / source.p2o5) * 100)
        if (source.k2o > 0 && remainK > 0)
            kgPerHa = Math.max(kgPerHa, (remainK / source.k2o) * 100)
        if (source.n > 0 && remainN > 0 && kgPerHa === 0)
            kgPerHa = (remainN / source.n) * 100

        if (kgPerHa <= 0) continue

        const nDel = (kgPerHa * source.n) / 100
        const pDel = (kgPerHa * source.p2o5) / 100
        const kDel = (kgPerHa * source.k2o) / 100
        const sDel = (kgPerHa * source.s) / 100

        remainN = Math.max(0, remainN - nDel)
        remainP = Math.max(0, remainP - pDel)
        remainK = Math.max(0, remainK - kDel)

        const costPerHa = (kgPerHa / 1000) * price

        results.push({
            name: source.name, kgPerHa, kgTotal: 0,
            costPerHa, costTotal: 0,
            nDelivered: nDel, pDelivered: pDel, kDelivered: kDel, sDelivered: sDel,
        })
    }

    return results
}

export function calculateFertilizerBlend(
    targets: BlendTargets,
    selectedSources: BlendSourceInput[],
    areaHa: number,
): FertilizerBlendResult | null {
    const blend = solveBlend(targets, selectedSources)
    if (blend.length === 0) return null

    const sources = blend.map(s => ({
        ...s,
        kgTotal: s.kgPerHa * areaHa,
        costTotal: s.costPerHa * areaHa,
    }))

    const nTotal = sources.reduce((sum, s) => sum + s.nDelivered, 0)
    const pTotal = sources.reduce((sum, s) => sum + s.pDelivered, 0)
    const kTotal = sources.reduce((sum, s) => sum + s.kDelivered, 0)
    const sTotal = sources.reduce((sum, s) => sum + s.sDelivered, 0)

    const totalCostPerHa = sources.reduce((sum, s) => sum + s.costPerHa, 0)
    const totalCostTotal = totalCostPerHa * areaHa
    const totalKgPerHa = sources.reduce((sum, s) => sum + s.kgPerHa, 0)

    return {
        sources, totalCostPerHa, totalCostTotal, totalKgPerHa,
        nTotal, pTotal, kTotal, sTotal,
        nExcess: Math.max(0, nTotal - targets.n),
        pExcess: Math.max(0, pTotal - targets.p),
        kExcess: Math.max(0, kTotal - targets.k),
    }
}

export function validateFertilizerBlend(targets: BlendTargets, sources: BlendSourceInput[], areaHa: number): string | null {
    if (targets.n <= 0 && targets.p <= 0 && targets.k <= 0) return 'Informe a necessidade de pelo menos um nutriente'
    if (!areaHa || areaHa <= 0) return 'Informe a área em hectares'
    if (areaHa > 100_000) return 'Área muito grande — verifique o valor'
    if (sources.length === 0) return 'Selecione pelo menos uma fonte de adubo'
    return null
}
