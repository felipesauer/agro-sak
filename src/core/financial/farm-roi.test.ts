import { describe, it, expect } from 'vitest'
import { calculateFarmROI, validateFarmROI } from './farm-roi'

describe('farm-roi', () => {
    const base = {
        investment: 4_200_000,
        grossRevenue: 5_980_000,
        totalCost: 4_200_000,
        months: 8,
        cdiRateAnnual: 13.75,
    }

    describe('calculateFarmROI', () => {
        it('calculates profit', () => {
            const r = calculateFarmROI(base)
            expect(r.profit).toBe(1_780_000)
        })

        it('calculates ROI', () => {
            const r = calculateFarmROI(base)
            // (1780000 / 4200000) * 100 ≈ 42.38%
            expect(r.roi).toBeCloseTo(42.38, 1)
        })

        it('calculates annualized ROI', () => {
            const r = calculateFarmROI(base)
            // (1 + 0.4238)^(12/8) - 1 ≈ 0.7192 → 71.92%
            expect(r.roiAnnualized).toBeGreaterThan(r.roi)
        })

        it('calculates CDI return', () => {
            const r = calculateFarmROI(base)
            // CDI monthly ≈ (1.1375)^(1/12) - 1 ≈ 0.01078
            // CDI return = 4200000 * ((1.01078)^8 - 1) ≈ 375k
            expect(r.cdiReturn).toBeGreaterThan(0)
            expect(r.cdiReturn).toBeLessThan(r.profit)
        })

        it('handles negative profit', () => {
            const r = calculateFarmROI({ ...base, grossRevenue: 3_000_000 })
            expect(r.profit).toBe(-1_200_000)
            expect(r.roi).toBeLessThan(0)
        })
    })

    describe('validateFarmROI', () => {
        it('passes', () => expect(validateFarmROI(base)).toBeNull())
        it('rejects zero investment', () => expect(validateFarmROI({ ...base, investment: 0 })).not.toBeNull())
        it('rejects zero months', () => expect(validateFarmROI({ ...base, months: 0 })).not.toBeNull())
        it('rejects zero grossRevenue', () => expect(validateFarmROI({ ...base, grossRevenue: 0 })).not.toBeNull())
        it('rejects zero totalCost', () => expect(validateFarmROI({ ...base, totalCost: 0 })).not.toBeNull())
    })

    describe('branch: zero denominators', () => {
        it('roi is 0 when investment is 0', () => {
            const r = calculateFarmROI({ ...base, investment: 0 })
            expect(r.roi).toBe(0)
        })

        it('roiAnnualized is 0 when months is 0', () => {
            const r = calculateFarmROI({ ...base, months: 0 })
            expect(r.roiAnnualized).toBe(0)
        })
    })
})
