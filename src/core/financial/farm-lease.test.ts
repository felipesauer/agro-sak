import { describe, it, expect } from 'vitest'
import { calculateFarmLease, validateFarmLease } from './farm-lease'

describe('farm-lease', () => {
    const base = {
        paymentMode: 'sacks' as const,
        leaseValue: 15,
        expectedYieldScHa: 62,
        sacPrice: 115,
        areaHa: 500,
        costWithoutLease: 3500,
    }

    describe('calculateFarmLease', () => {
        it('calculates lease cost per ha (sacks mode)', () => {
            const r = calculateFarmLease(base)
            expect(r.leaseCostHa).toBe(1725) // 15 * 115
        })

        it('calculates lease cost per ha (fixed mode)', () => {
            const r = calculateFarmLease({ ...base, paymentMode: 'fixed', leaseValue: 1725 })
            expect(r.leaseCostHa).toBe(1725)
        })

        it('calculates total lease cost', () => {
            const r = calculateFarmLease(base)
            expect(r.totalLeaseCost).toBe(862_500) // 1725 * 500
        })

        it('calculates percent of cost', () => {
            const r = calculateFarmLease(base)
            // totalCost = 3500 + 1725 = 5225, pct = 1725/5225 ≈ 33.01%
            expect(r.percentOfCost).toBeCloseTo(33.01, 0)
        })

        it('calculates percent of revenue', () => {
            const r = calculateFarmLease(base)
            // revenue = 62 * 115 = 7130, pct = 1725/7130 ≈ 24.19%
            expect(r.percentOfRevenue).toBeCloseTo(24.19, 0)
        })
    })

    describe('validateFarmLease', () => {
        it('passes', () => expect(validateFarmLease(base)).toBeNull())
        it('rejects zero lease', () => expect(validateFarmLease({ ...base, leaseValue: 0 })).not.toBeNull())
        it('rejects zero price', () => expect(validateFarmLease({ ...base, sacPrice: 0 })).not.toBeNull())
        it('rejects zero expectedYieldScHa', () => expect(validateFarmLease({ ...base, expectedYieldScHa: 0 })).not.toBeNull())
    })

    describe('branch: zero denominators in calc', () => {
        it('percentOfCost is 0 when totalCost is 0', () => {
            const r = calculateFarmLease({ ...base, paymentMode: 'fixed', leaseValue: 0, costWithoutLease: 0 })
            expect(r.percentOfCost).toBe(0)
        })

        it('percentOfRevenue is 0 when revenueHa is 0', () => {
            const r = calculateFarmLease({ ...base, expectedYieldScHa: 0 })
            expect(r.revenueHa).toBe(0)
            expect(r.percentOfRevenue).toBe(0)
        })
    })
})
