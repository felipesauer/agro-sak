import { describe, it, expect } from 'vitest'
import { calculateGrainFreight, validateGrainFreight } from './grain-freight'

describe('grain-freight', () => {
    const base = {
        distanceKm: 300,
        freightPerKm: 5.0,
        loadTons: 30,
        sacPrice: 130,
        sacWeightKg: 60,
    }

    describe('calculateGrainFreight', () => {
        it('calculates total freight', () => {
            const r = calculateGrainFreight(base)
            expect(r.totalFreight).toBe(1500) // 300 × 5
        })

        it('calculates cost per ton', () => {
            const r = calculateGrainFreight(base)
            expect(r.costPerTon).toBe(50) // 1500/30
        })

        it('calculates cost per sac', () => {
            const r = calculateGrainFreight(base)
            // sacs per ton = 1000/60 ≈ 16.667, cost per sac = 50/16.667 ≈ 3.0
            expect(r.costPerSac).toBeCloseTo(3.0, 1)
        })

        it('calculates freight as % of sac price', () => {
            const r = calculateGrainFreight(base)
            // 3.0 / 130 × 100 ≈ 2.31%
            expect(r.freightPercent).toBeCloseTo(2.31, 1)
        })

        it('handles large distance', () => {
            const r = calculateGrainFreight({ ...base, distanceKm: 1500 })
            expect(r.totalFreight).toBe(7500)
        })

        it('handles zero sac price without error', () => {
            const r = calculateGrainFreight({ ...base, sacPrice: 0 })
            expect(r.freightPercent).toBe(0)
        })
    })

    describe('validateGrainFreight', () => {
        it('passes with valid inputs', () => {
            expect(validateGrainFreight(base)).toBeNull()
        })

        it('rejects zero distance', () => {
            expect(validateGrainFreight({ ...base, distanceKm: 0 })).not.toBeNull()
        })

        it('rejects zero freight per km', () => {
            expect(validateGrainFreight({ ...base, freightPerKm: 0 })).not.toBeNull()
        })

        it('rejects zero load', () => {
            expect(validateGrainFreight({ ...base, loadTons: 0 })).not.toBeNull()
        })
    })

    describe('branch: edge cases', () => {
        it('costPerTon is 0 when loadTons is 0', () => {
            const r = calculateGrainFreight({ ...base, loadTons: 0 })
            expect(r.costPerTon).toBe(0)
        })
    })
})
