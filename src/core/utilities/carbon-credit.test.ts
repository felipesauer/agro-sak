import { describe, it, expect } from 'vitest'
import { calculateCarbonCredit, validateCarbonCredit } from './carbon-credit'

describe('carbon-credit', () => {
    const base = {
        areaHa: 100,
        cropSystem: 'soybean_corn',
        noTill: true,
        coverCrop: false,
        ilpf: false,
        years: 10,
        carbonPrice: 50,
    }

    describe('calculateCarbonCredit', () => {
        it('calculates annual sequestration with base rate + no-till', () => {
            const r = calculateCarbonCredit(base)!
            // soybean_corn=0.4, no-till=0.5 => totalRate=0.9, annual=0.9*100=90
            expect(r.annualSequestration).toBeCloseTo(90, 1)
        })

        it('calculates total sequestration over years', () => {
            const r = calculateCarbonCredit(base)!
            expect(r.totalSequestration).toBeCloseTo(900, 0)
        })

        it('calculates revenue correctly', () => {
            const r = calculateCarbonCredit(base)!
            expect(r.annualRevenue).toBeCloseTo(90 * 50, 0)
            expect(r.totalRevenue).toBeCloseTo(900 * 50, 0)
        })

        it('calculates revenue per ha', () => {
            const r = calculateCarbonCredit(base)!
            // totalRate=0.9 * 50 = 45
            expect(r.revenuePerHa).toBeCloseTo(45, 1)
        })

        it('adds all practice bonuses', () => {
            const r = calculateCarbonCredit({ ...base, coverCrop: true, ilpf: true })!
            // 0.4+0.5+0.3+1.2 = 2.4, annual=240
            expect(r.annualSequestration).toBeCloseTo(240, 0)
            expect(r.practices).toHaveLength(4)
        })

        it('calculates equivalent trees', () => {
            const r = calculateCarbonCredit(base)!
            expect(r.equivalentTrees).toBe(Math.round(90 / 0.022))
        })

        it('returns null for invalid area', () => {
            expect(calculateCarbonCredit({ ...base, areaHa: 0 })).toBeNull()
        })

        it('uses default rate for unknown crop system', () => {
            const r = calculateCarbonCredit({ ...base, cropSystem: 'unknown' })!
            // falls back to soybean_corn=0.4
            expect(r.practices[0].contribution).toBeCloseTo(0.4 * 100, 0)
        })

        it('handles no practices scenario', () => {
            const r = calculateCarbonCredit({ ...base, noTill: false })!
            // only base 0.4 * 100 = 40
            expect(r.annualSequestration).toBeCloseTo(40, 0)
            expect(r.practices).toHaveLength(1)
        })

        it('handles pasture crop system with higher base rate', () => {
            const r = calculateCarbonCredit({ ...base, cropSystem: 'pasture', noTill: false })!
            // pasture=0.8 * 100 = 80
            expect(r.annualSequestration).toBeCloseTo(80, 0)
        })
    })

    describe('validateCarbonCredit', () => {
        it('returns null for valid input', () => {
            expect(validateCarbonCredit(base)).toBeNull()
        })

        it('rejects zero area', () => {
            expect(validateCarbonCredit({ ...base, areaHa: 0 })).toBeTruthy()
        })

        it('rejects area over 100k', () => {
            expect(validateCarbonCredit({ ...base, areaHa: 100001 })).toBeTruthy()
        })

        it('rejects years out of range', () => {
            expect(validateCarbonCredit({ ...base, years: 0 })).toBeTruthy()
            expect(validateCarbonCredit({ ...base, years: 51 })).toBeTruthy()
        })

        it('rejects zero carbon price', () => {
            expect(validateCarbonCredit({ ...base, carbonPrice: 0 })).toBeTruthy()
        })
    })
})
