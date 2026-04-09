import { describe, it, expect } from 'vitest'
import { calculateNutrientRemoval, validateNutrientRemoval } from './nutrient-removal'

describe('nutrient-removal', () => {
    const base = {
        productivityScHa: 65,
        bagWeightKg: 60,
        coefficients: { n: 15, p2o5: 8, k2o: 5, s: 2 },
        includeStraw: false,
    }

    describe('calculateNutrientRemoval', () => {
        it('calculates N removal', () => {
            const r = calculateNutrientRemoval(base)
            // tons/ha = 65 * 60 / 1000 = 3.9; N = 3.9 * 15 = 58.5
            expect(r.rows[0].kgPerHa).toBeCloseTo(58.5, 1)
        })

        it('applies straw factor', () => {
            const r = calculateNutrientRemoval({ ...base, includeStraw: true, strawFactor: 1.3 })
            expect(r.rows[0].kgPerHa).toBeCloseTo(58.5 * 1.3, 1)
        })

        it('calculates total with area', () => {
            const r = calculateNutrientRemoval({ ...base, areaHa: 500 })
            expect(r.rows[0].totalKg).toBeCloseTo(58.5 * 500, 0)
        })

        it('totalKg is null without area', () => {
            const r = calculateNutrientRemoval(base)
            expect(r.rows[0].totalKg).toBeNull()
        })

        it('returns 4 nutrient rows', () => {
            const r = calculateNutrientRemoval(base)
            expect(r.rows).toHaveLength(4)
        })
    })

    describe('validateNutrientRemoval', () => {
        it('passes', () => expect(validateNutrientRemoval(base)).toBeNull())
        it('rejects zero productivity', () => expect(validateNutrientRemoval({ ...base, productivityScHa: 0 })).not.toBeNull())
    })

    it('uses default strawFactor 1.3 when includeStraw=true and strawFactor is undefined', () => {
        const r = calculateNutrientRemoval({ ...base, includeStraw: true })
        // tonsPerHa = 65 * 60 / 1000 = 3.9; N = 3.9 * 15 * 1.3 = 76.05
        expect(r.rows[0].kgPerHa).toBeCloseTo(76.05, 1)
    })
})
