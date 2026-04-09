import { describe, it, expect } from 'vitest'
import { calculateLivestock, validateLivestock } from './livestock'

describe('livestock', () => {
    const base = {
        herdSize: 100,
        purchaseWeightArroba: 12,
        purchasePricePerArroba: 270,
        saleWeightArroba: 20,
        salePricePerArroba: 310,
        finishingMonths: 12,
        pastureCostPerHeadMonth: 80,
        supplementCostPerHeadMonth: 60,
        healthCostPerHead: 150,
        otherCostsPerHead: 100,
        mortalityRatePercent: 3,
    }

    describe('calculateLivestock', () => {
        it('calculates purchaseTotal', () => {
            const r = calculateLivestock(base)
            // 100 * 12 * 270 = 324000
            expect(r.purchaseTotal).toBe(324_000)
        })

        it('calculates effectiveHeads with mortality', () => {
            const r = calculateLivestock(base)
            // 100 * (1 - 0.03) = 97
            expect(r.effectiveHeads).toBe(97)
        })

        it('calculates saleTotal', () => {
            const r = calculateLivestock(base)
            // 97 * 20 * 310 = 601400
            expect(r.saleTotal).toBe(601_400)
        })

        it('calculates operational cost', () => {
            const r = calculateLivestock(base)
            // pasture: 100*80*12=96000, supplement: 100*60*12=72000, health: 100*150=15000, other: 100*100=10000
            expect(r.totalOperationalCost).toBe(193_000)
        })

        it('calculates profit', () => {
            const r = calculateLivestock(base)
            expect(r.profit).toBe(r.saleTotal - r.totalCost)
        })

        it('calculates arrobasProduced', () => {
            const r = calculateLivestock(base)
            // 97 * (20 - 12) = 776
            expect(r.arrobasProduced).toBe(776)
        })

        it('calculates margin and roi', () => {
            const r = calculateLivestock(base)
            expect(r.margin).toBeCloseTo((r.profit / r.saleTotal) * 100, 2)
            expect(r.roi).toBeCloseTo((r.profit / r.totalCost) * 100, 2)
        })

        it('handles zero mortality', () => {
            const r = calculateLivestock({ ...base, mortalityRatePercent: 0 })
            expect(r.effectiveHeads).toBe(100)
        })
    })

    describe('validateLivestock', () => {
        it('passes', () => expect(validateLivestock(base)).toBeNull())
        it('rejects zero herd', () => expect(validateLivestock({ ...base, herdSize: 0 })).not.toBeNull())
        it('rejects sale <= purchase weight', () =>
            expect(validateLivestock({ ...base, saleWeightArroba: 12 })).not.toBeNull())
        it('rejects zero finishing months', () =>
            expect(validateLivestock({ ...base, finishingMonths: 0 })).not.toBeNull())
        it('rejects zero purchaseWeightArroba', () =>
            expect(validateLivestock({ ...base, purchaseWeightArroba: 0 })).not.toBeNull())
        it('rejects zero purchasePricePerArroba', () =>
            expect(validateLivestock({ ...base, purchasePricePerArroba: 0 })).not.toBeNull())
        it('rejects zero saleWeightArroba', () =>
            expect(validateLivestock({ ...base, saleWeightArroba: 0 })).not.toBeNull())
        it('rejects zero salePricePerArroba', () =>
            expect(validateLivestock({ ...base, salePricePerArroba: 0 })).not.toBeNull())
    })

    describe('branch: zero denominators in calc', () => {
        it('margin is 0 when saleTotal is 0', () => {
            const r = calculateLivestock({ ...base, salePricePerArroba: 0, saleWeightArroba: 0 })
            expect(r.saleTotal).toBe(0)
            expect(r.margin).toBe(0)
        })

        it('costPerArroba and revenuePerArroba are 0 when arrobasProduced is 0', () => {
            const r = calculateLivestock({ ...base, saleWeightArroba: 12 })
            expect(r.arrobasProduced).toBe(0)
            expect(r.costPerArroba).toBe(0)
            expect(r.revenuePerArroba).toBe(0)
        })

        it('roi is 0 when totalCost is 0', () => {
            const r = calculateLivestock({
                ...base,
                purchaseWeightArroba: 0,
                purchasePricePerArroba: 0,
                pastureCostPerHeadMonth: 0,
                supplementCostPerHeadMonth: 0,
                healthCostPerHead: 0,
                otherCostsPerHead: 0,
            })
            expect(r.totalCost).toBe(0)
            expect(r.roi).toBe(0)
        })
    })
})
