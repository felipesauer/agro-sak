import { describe, it, expect } from 'vitest'
import { calculateStorageViability, validateStorageViability } from './storage-viability'

describe('calculateStorageViability', () => {
    const base = {
        quantitySc: 10_000,
        currentPricePerSc: 105,
        futurePricePerSc: 120,
        storageMonths: 4,
        storageFeePerScMonth: 0.45,
        breakageRatePctMonth: 0.1,
        capitalRatePctMonth: 1,
        insuranceRatePctMonth: 0.05,
    }

    it('calcula receita imediata', () => {
        const r = calculateStorageViability(base)
        expect(r.immediateRevenue).toBe(1_050_000)
    })

    it('calcula custos de armazenagem', () => {
        const r = calculateStorageViability(base)
        expect(r.storageCost).toBeCloseTo(10_000 * 0.45 * 4, 0) // 18000
        expect(r.capitalCost).toBeCloseTo(1_050_000 * 0.01 * 4, 0) // 42000
        expect(r.insuranceCost).toBeCloseTo(1_050_000 * 0.0005 * 4, 0) // 2100
    })

    it('calcula quebra técnica em sacas', () => {
        const r = calculateStorageViability(base)
        // breakage = 10000 * 0.001 * 4 = 40 sacas
        expect(r.breakageSc).toBeCloseTo(40, 1)
    })

    it('calcula preço de break-even', () => {
        const r = calculateStorageViability(base)
        const netQty = 10_000 - r.breakageSc
        const expected = (r.immediateRevenue + r.totalCost) / netQty
        expect(r.breakEvenPrice).toBeCloseTo(expected, 2)
    })

    it('recomenda vender quando futuro é baixo', () => {
        const r = calculateStorageViability({ ...base, futurePricePerSc: 106 })
        expect(r.netGain).toBeLessThan(0)
        expect(r.recommendation).toContain('vender agora')
    })

    it('recomenda armazenar quando futuro é alto', () => {
        const r = calculateStorageViability({ ...base, futurePricePerSc: 150 })
        expect(r.netGain).toBeGreaterThan(0)
        expect(r.recommendation).toContain('armazenar')
    })
})

describe('validateStorageViability', () => {
    it('rejeita quantidade zero', () => {
        expect(validateStorageViability({ quantitySc: 0, currentPricePerSc: 100, futurePricePerSc: 120, storageMonths: 4 })).toBeTruthy()
    })

    it('aceita válidos', () => {
        expect(validateStorageViability({ quantitySc: 10000, currentPricePerSc: 100, futurePricePerSc: 120, storageMonths: 4 })).toBeNull()
    })

    it('rejeita preço atual zero', () => {
        expect(validateStorageViability({ quantitySc: 10000, currentPricePerSc: 0, futurePricePerSc: 120, storageMonths: 4 })).toBeTruthy()
    })

    it('rejeita preço futuro zero', () => {
        expect(validateStorageViability({ quantitySc: 10000, currentPricePerSc: 100, futurePricePerSc: 0, storageMonths: 4 })).toBeTruthy()
    })

    it('rejeita prazo zero', () => {
        expect(validateStorageViability({ quantitySc: 10000, currentPricePerSc: 100, futurePricePerSc: 120, storageMonths: 0 })).toBeTruthy()
    })
})

describe('branch: breakEvenPrice zero when netQty <= 0', () => {
    it('breakEvenPrice is 0 when breakage exceeds quantity', () => {
        const r = calculateStorageViability({
            quantitySc: 100,
            currentPricePerSc: 100,
            futurePricePerSc: 120,
            storageMonths: 1000,
            storageFeePerScMonth: 0.01,
            breakageRatePctMonth: 100,
            capitalRatePctMonth: 0,
            insuranceRatePctMonth: 0,
        })
        expect(r.breakEvenPrice).toBe(0)
    })
})
