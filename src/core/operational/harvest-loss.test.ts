import { describe, it, expect } from 'vitest'
import { calculateHarvestLoss, validateHarvestLoss, GRAINS_PER_SC } from './harvest-loss'

describe('harvest-loss', () => {
    const base = {
        grainsFactor: 16, // soybean: 16 grains/m² = 1 sc/ha
        sacPrice: 130,
        expectedYieldScHa: 60,
        preHarvestGrains: 8,   // 0.5 sc/ha
        platformGrains: 16,    // 1.0 sc/ha
        threshingGrains: 4,    // 0.25 sc/ha
    }

    describe('GRAINS_PER_SC', () => {
        it('has soybean at 16', () => expect(GRAINS_PER_SC['soybean']).toBe(16))
        it('has corn at 8', () => expect(GRAINS_PER_SC['corn']).toBe(8))
    })

    describe('calculateHarvestLoss', () => {
        it('calculates 3 loss stages', () => {
            const r = calculateHarvestLoss(base)
            expect(r.losses).toHaveLength(3)
        })

        it('calculates pre-harvest loss', () => {
            const r = calculateHarvestLoss(base)
            expect(r.losses[0].scHa).toBe(0.5) // 8/16
        })

        it('calculates platform loss', () => {
            const r = calculateHarvestLoss(base)
            expect(r.losses[1].scHa).toBe(1.0) // 16/16
        })

        it('calculates total loss', () => {
            const r = calculateHarvestLoss(base)
            expect(r.totalScHa).toBe(1.75)
        })

        it('calculates total cost per ha', () => {
            const r = calculateHarvestLoss(base)
            expect(r.totalCostHa).toBe(1.75 * 130) // 227.50
        })

        it('calculates total cost for area', () => {
            const r = calculateHarvestLoss({ ...base, areaHa: 100 })
            expect(r.totalCostArea).toBe(1.75 * 130 * 100)
        })

        it('returns null totalCostArea when no area', () => {
            const r = calculateHarvestLoss(base)
            expect(r.totalCostArea).toBeNull()
        })

        it('calculates percent loss', () => {
            const r = calculateHarvestLoss(base)
            expect(r.percentLoss).toBeCloseTo((1.75 / 60) * 100, 2)
        })

        it('severity is warning for 1 < total <= 2', () => {
            const r = calculateHarvestLoss(base)
            expect(r.severity).toBe('warning')
        })

        it('severity is success for total <= 1', () => {
            const r = calculateHarvestLoss({ ...base, preHarvestGrains: 4, platformGrains: 4, threshingGrains: 4 })
            // 4/16 + 4/16 + 4/16 = 0.75
            expect(r.severity).toBe('success')
        })

        it('severity is error for total > 2', () => {
            const r = calculateHarvestLoss({ ...base, preHarvestGrains: 16, platformGrains: 16, threshingGrains: 16 })
            // 1 + 1 + 1 = 3
            expect(r.severity).toBe('error')
        })
    })

    describe('validateHarvestLoss', () => {
        it('passes with valid inputs', () => {
            expect(validateHarvestLoss(base)).toBeNull()
        })

        it('rejects zero yield', () => {
            expect(validateHarvestLoss({ ...base, expectedYieldScHa: 0 })).not.toBeNull()
        })

        it('rejects NaN grain inputs', () => {
            expect(validateHarvestLoss({ ...base, preHarvestGrains: NaN })).not.toBeNull()
        })

        it('rejects zero sac price', () => {
            expect(validateHarvestLoss({ ...base, sacPrice: 0 })).not.toBeNull()
        })

        it('rejects NaN platformGrains', () => {
            expect(validateHarvestLoss({ ...base, platformGrains: NaN })).not.toBeNull()
        })

        it('rejects NaN threshingGrains', () => {
            expect(validateHarvestLoss({ ...base, threshingGrains: NaN })).not.toBeNull()
        })
    })

    describe('branch: edge cases', () => {
        it('percentLoss is 0 when expectedYieldScHa is 0', () => {
            const r = calculateHarvestLoss({ ...base, expectedYieldScHa: 0 })
            expect(r.percentLoss).toBe(0)
        })

        it('totalCostArea is null when areaHa is 0', () => {
            const r = calculateHarvestLoss({ ...base, areaHa: 0 })
            expect(r.totalCostArea).toBeNull()
        })
    })
})
