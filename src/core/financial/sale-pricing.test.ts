import { describe, it, expect } from 'vitest'
import { calculateSalePricing, validateSalePricing, FUNRURAL_RATE } from './sale-pricing'

describe('sale-pricing', () => {
    const base = {
        costPerSc: 68,
        producerType: 'pf',
        icmsPercent: 0,
        desiredMarginPercent: 20,
        brokerFeePercent: 1,
    }

    describe('FUNRURAL_RATE', () => {
        it('PF is 1.5%', () => expect(FUNRURAL_RATE['pf']).toBe(1.5))
        it('PJ is 2.85%', () => expect(FUNRURAL_RATE['pj']).toBe(2.85))
    })

    describe('calculateSalePricing', () => {
        it('calculates total tax rate', () => {
            const r = calculateSalePricing(base)
            expect(r.totalTaxRate).toBe(2.5) // 1.5 + 0 + 1
        })

        it('calculates min price (no margin)', () => {
            const r = calculateSalePricing(base)
            // 68 / (1 - 0.025) = 68 / 0.975 ≈ 69.74
            expect(r.minPrice).toBeCloseTo(69.74, 1)
        })

        it('calculates price with margin', () => {
            const r = calculateSalePricing(base)
            // 68 / (1 - 0.225) = 68 / 0.775 ≈ 87.74
            expect(r.priceWithMargin).toBeCloseTo(87.74, 1)
        })

        it('calculates markup', () => {
            const r = calculateSalePricing(base)
            expect(r.markup).toBeCloseTo(((r.priceWithMargin - 68) / 68) * 100, 1)
        })

        it('returns null marketDiff when no market price', () => {
            const r = calculateSalePricing(base)
            expect(r.marketDiff).toBeNull()
        })

        it('calculates positive market diff', () => {
            const r = calculateSalePricing({ ...base, marketPrice: 130 })
            expect(r.marketDiff).toBeCloseTo(130 - r.priceWithMargin, 1)
        })

        it('PJ has higher tax rate', () => {
            const r = calculateSalePricing({ ...base, producerType: 'pj' })
            expect(r.totalTaxRate).toBe(3.85) // 2.85 + 0 + 1
        })
    })

    describe('validateSalePricing', () => {
        it('passes with valid inputs', () => {
            expect(validateSalePricing(base)).toBeNull()
        })

        it('rejects zero cost', () => {
            expect(validateSalePricing({ ...base, costPerSc: 0 })).not.toBeNull()
        })

        it('rejects deductions >= 100%', () => {
            expect(validateSalePricing({ ...base, desiredMarginPercent: 98 })).not.toBeNull()
        })
    })

    describe('branch: unknown producerType', () => {
        it('falls back to 1.5% funrural for unknown type in calculate', () => {
            const r = calculateSalePricing({ ...base, producerType: 'unknown' })
            expect(r.totalTaxRate).toBe(1.5 + 0 + 1) // fallback 1.5 + icms 0 + broker 1
        })

        it('falls back to 1.5% funrural for unknown type in validate', () => {
            expect(validateSalePricing({ ...base, producerType: 'unknown', desiredMarginPercent: 20 })).toBeNull()
        })

        it('returns null marketDiff when marketPrice is 0', () => {
            const r = calculateSalePricing({ ...base, marketPrice: 0 })
            expect(r.marketDiff).toBeNull()
        })
    })
})
