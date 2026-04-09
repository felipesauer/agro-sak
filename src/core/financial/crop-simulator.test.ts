import { describe, it, expect } from 'vitest'
import { calculateCropSimulator, validateCropSimulator } from './crop-simulator'

describe('crop-simulator', () => {
    const base = {
        productionCost: 3200,
        areaHa: 100,
        priceMin: 90,
        priceMax: 150,
        prodMin: 40,
        prodMax: 70,
        funruralPercent: 1.5,
    }

    describe('calculateCropSimulator', () => {
        it('returns 3 scenarios', () => {
            const r = calculateCropSimulator(base)!
            expect(r.scenarios).toHaveLength(3)
            expect(r.scenarios[0].label).toBe('Pessimista')
            expect(r.scenarios[1].label).toBe('Base')
            expect(r.scenarios[2].label).toBe('Otimista')
        })

        it('generates 7x7 heatmap', () => {
            const r = calculateCropSimulator(base)!
            expect(r.heatmap).toHaveLength(7)
            expect(r.heatmap[0]).toHaveLength(7)
        })

        it('generates 7 price steps from min to max', () => {
            const r = calculateCropSimulator(base)!
            expect(r.priceSteps).toHaveLength(7)
            expect(r.priceSteps[0]).toBeCloseTo(90, 0)
            expect(r.priceSteps[6]).toBeCloseTo(150, 0)
        })

        it('generates 7 prod steps from min to max', () => {
            const r = calculateCropSimulator(base)!
            expect(r.prodSteps).toHaveLength(7)
            expect(r.prodSteps[0]).toBeCloseTo(40, 0)
            expect(r.prodSteps[6]).toBeCloseTo(70, 0)
        })

        it('calculates heatmap profit correctly', () => {
            const r = calculateCropSimulator(base)!
            const cell = r.heatmap[0][0] // prodMin x priceMin
            const gross = 100 * 40 * 90
            const funrural = gross * 0.015
            const expected = gross - funrural - 3200 * 100
            expect(cell.profit).toBeCloseTo(expected, 0)
        })

        it('pessimistic scenario uses index [1,1]', () => {
            const r = calculateCropSimulator(base)!
            const s = r.scenarios[0]
            expect(s.price).toBeCloseTo(r.priceSteps[1], 2)
            expect(s.productivity).toBeCloseTo(r.prodSteps[1], 2)
        })

        it('base scenario uses index [3,3]', () => {
            const r = calculateCropSimulator(base)!
            const s = r.scenarios[1]
            expect(s.price).toBeCloseTo(r.priceSteps[3], 2)
            expect(s.productivity).toBeCloseTo(r.prodSteps[3], 2)
        })

        it('calculates breakEvenProd', () => {
            const r = calculateCropSimulator(base)!
            const midPrice = r.priceSteps[3]
            const expected = 3200 / (midPrice * (1 - 0.015))
            expect(r.breakEvenProd).toBeCloseTo(expected, 2)
        })

        it('scenario ROI = (profit/totalCost)*100', () => {
            const r = calculateCropSimulator(base)!
            const s = r.scenarios[1]
            const expectedRoi = (s.profit / s.totalCost) * 100
            expect(s.roi).toBeCloseTo(expectedRoi, 2)
        })

        it('returns null for zero area', () => {
            expect(calculateCropSimulator({ ...base, areaHa: 0 })).toBeNull()
        })

        it('returns null for zero productionCost', () => {
            expect(calculateCropSimulator({ ...base, productionCost: 0 })).toBeNull()
        })
    })

    describe('validateCropSimulator', () => {
        it('returns null for valid input', () => {
            expect(validateCropSimulator(base)).toBeNull()
        })

        it('rejects zero cost', () => {
            expect(validateCropSimulator({ ...base, productionCost: 0 })).toBeTruthy()
        })

        it('rejects zero area', () => {
            expect(validateCropSimulator({ ...base, areaHa: 0 })).toBeTruthy()
        })

        it('rejects priceMin >= priceMax', () => {
            expect(validateCropSimulator({ ...base, priceMin: 150, priceMax: 150 })).toBeTruthy()
        })

        it('rejects prodMin >= prodMax', () => {
            expect(validateCropSimulator({ ...base, prodMin: 70, prodMax: 70 })).toBeTruthy()
        })

        it('rejects zero priceMin', () => {
            expect(validateCropSimulator({ ...base, priceMin: 0 })).toBeTruthy()
        })

        it('rejects zero prodMin', () => {
            expect(validateCropSimulator({ ...base, prodMin: 0 })).toBeTruthy()
        })
    })
})
