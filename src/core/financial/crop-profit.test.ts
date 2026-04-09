import { describe, it, expect } from 'vitest'
import { calculateCropProfit, validateCropProfit } from './crop-profit'

describe('crop-profit', () => {
    const base = {
        areaHa: 200,
        taxRate: 0.015,
        scenarios: [
            { label: 'Pessimista', yieldScHa: 50, pricePerSc: 100, costPerHa: 4000 },
            { label: 'Realista', yieldScHa: 65, pricePerSc: 120, costPerHa: 4500 },
            { label: 'Otimista', yieldScHa: 75, pricePerSc: 140, costPerHa: 5000 },
        ],
    }

    describe('calculateCropProfit', () => {
        it('returns 3 scenarios', () => {
            const r = calculateCropProfit(base)
            expect(r.scenarios).toHaveLength(3)
        })

        it('calculates gross revenue', () => {
            const r = calculateCropProfit(base)
            const realistic = r.scenarios[1]
            // 65 * 120 = 7800
            expect(realistic.grossRevenue).toBe(7800)
        })

        it('calculates taxes', () => {
            const r = calculateCropProfit(base)
            const realistic = r.scenarios[1]
            // 7800 * 0.015 = 117
            expect(realistic.taxes).toBeCloseTo(117, 2)
        })

        it('calculates net revenue', () => {
            const r = calculateCropProfit(base)
            const realistic = r.scenarios[1]
            expect(realistic.netRevenue).toBeCloseTo(7800 - 117, 2)
        })

        it('calculates profit per ha', () => {
            const r = calculateCropProfit(base)
            const realistic = r.scenarios[1]
            expect(realistic.profit).toBeCloseTo(7800 - 117 - 4500, 2)
        })

        it('calculates totalResult = profit * area', () => {
            const r = calculateCropProfit(base)
            const realistic = r.scenarios[1]
            expect(realistic.totalResult).toBeCloseTo(realistic.profit * 200, 1)
        })

        it('calculates margin and roi', () => {
            const r = calculateCropProfit(base)
            const realistic = r.scenarios[1]
            expect(realistic.margin).toBeCloseTo((realistic.profit / realistic.grossRevenue) * 100, 2)
            expect(realistic.roi).toBeCloseTo((realistic.profit / 4500) * 100, 2)
        })

        it('pessimist yields worst result', () => {
            const r = calculateCropProfit(base)
            expect(r.scenarios[0].profit).toBeLessThan(r.scenarios[1].profit)
        })

        it('optimist yields best result', () => {
            const r = calculateCropProfit(base)
            expect(r.scenarios[2].profit).toBeGreaterThan(r.scenarios[1].profit)
        })
    })

    describe('validateCropProfit', () => {
        it('passes', () => expect(validateCropProfit(base)).toBeNull())
        it('rejects zero area', () => expect(validateCropProfit({ ...base, areaHa: 0 })).not.toBeNull())
        it('rejects empty scenarios', () => expect(validateCropProfit({ ...base, scenarios: [] })).not.toBeNull())
        it('rejects incomplete Realista scenario', () => {
            expect(validateCropProfit({
                ...base,
                scenarios: [{ label: 'Realista', yieldScHa: 0, pricePerSc: 0, costPerHa: 0 }],
            })).not.toBeNull()
        })
    })

    describe('branch: zero costPerHa', () => {
        it('roi is 0 when costPerHa is 0', () => {
            const r = calculateCropProfit({
                ...base,
                scenarios: [{ label: 'Test', yieldScHa: 60, pricePerSc: 100, costPerHa: 0 }],
            })
            expect(r.scenarios[0].roi).toBe(0)
        })

        it('margin is 0 when grossRevenue is 0', () => {
            const r = calculateCropProfit({
                ...base,
                scenarios: [{ label: 'Test', yieldScHa: 0, pricePerSc: 0, costPerHa: 100 }],
            })
            expect(r.scenarios[0].margin).toBe(0)
        })
    })
})
