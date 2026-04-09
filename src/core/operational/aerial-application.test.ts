import { describe, it, expect } from 'vitest'
import { calculateAerialApplication, validateAerialApplication } from './aerial-application'

describe('aerial-application', () => {
    const base = {
        areaHa: 500,
        aerialCostPerHa: 50,
        groundCostPerHa: 30,
        numApplications: 3,
        daysSavedPerApp: 2,
        dailyCropLossPerHa: 5,
        productCostPerHa: 80,
    }

    describe('calculateAerialApplication', () => {
        it('calculates aerial operation total', () => {
            const r = calculateAerialApplication(base)
            // 50 × 500 × 3 = 75000
            expect(r.aerialOperationTotal).toBe(75000)
        })

        it('calculates ground operation total', () => {
            const r = calculateAerialApplication(base)
            // 30 × 500 × 3 = 45000
            expect(r.groundOperationTotal).toBe(45000)
        })

        it('product costs are equal (same product both ways)', () => {
            const r = calculateAerialApplication(base)
            expect(r.aerialProductTotal).toBe(r.groundProductTotal)
            // 80 × 500 × 3 = 120000
            expect(r.aerialProductTotal).toBe(120000)
        })

        it('calculates grand totals', () => {
            const r = calculateAerialApplication(base)
            expect(r.aerialGrandTotal).toBe(75000 + 120000) // 195000
            expect(r.groundGrandTotal).toBe(45000 + 120000) // 165000
        })

        it('calculates total days saved', () => {
            const r = calculateAerialApplication(base)
            expect(r.totalDaysSaved).toBe(6) // 2 × 3
        })

        it('calculates time savings value', () => {
            const r = calculateAerialApplication(base)
            // 5 × 500 × 6 = 15000
            expect(r.timeSavingsValue).toBe(15000)
        })

        it('calculates net savings', () => {
            const r = calculateAerialApplication(base)
            // (165000 - 195000) + 15000 = -30000 + 15000 = -15000
            expect(r.netSavings).toBe(-15000)
        })

        it('positive net savings when time value is high', () => {
            const r = calculateAerialApplication({ ...base, dailyCropLossPerHa: 20 })
            // timeSavingsValue = 20 × 500 × 6 = 60000
            // netSavings = -30000 + 60000 = 30000
            expect(r.netSavings).toBe(30000)
        })
    })

    describe('validateAerialApplication', () => {
        it('passes with valid inputs', () => {
            expect(validateAerialApplication(base)).toBeNull()
        })

        it('rejects zero area', () => {
            expect(validateAerialApplication({ ...base, areaHa: 0 })).not.toBeNull()
        })

        it('rejects zero aerial cost', () => {
            expect(validateAerialApplication({ ...base, aerialCostPerHa: 0 })).not.toBeNull()
        })

        it('rejects zero ground cost', () => {
            expect(validateAerialApplication({ ...base, groundCostPerHa: 0 })).not.toBeNull()
        })

        it('rejects zero applications', () => {
            expect(validateAerialApplication({ ...base, numApplications: 0 })).not.toBeNull()
        })
    })
})
