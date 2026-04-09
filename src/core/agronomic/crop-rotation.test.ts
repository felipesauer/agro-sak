import { describe, it, expect } from 'vitest'
import { calculateCropRotation, validateCropRotation } from './crop-rotation'

describe('crop-rotation', () => {
    const base = {
        system: 'soy_corn' as const,
        soybeanYield: 60,
        soybeanPrice: 120,
        soybeanCost: 4500,
        rotationBonusPercent: 8,
        secondCropYield: 90,
        secondCropPrice: 55,
        secondCropCost: 3200,
    }

    describe('calculateCropRotation', () => {
        it('applies rotation bonus to soybean yield', () => {
            const r = calculateCropRotation(base)
            expect(r.rows[0].yield).toBeCloseTo(64.8, 1) // 60 * 1.08
        })

        it('calculates soybean revenue', () => {
            const r = calculateCropRotation(base)
            expect(r.rows[0].revenue).toBeCloseTo(64.8 * 120, 0)
        })

        it('includes second crop row', () => {
            const r = calculateCropRotation(base)
            expect(r.rows).toHaveLength(2)
            expect(r.rows[1].crop).toBe('Milho safrinha')
        })

        it('calculates annual profit sum', () => {
            const r = calculateCropRotation(base)
            expect(r.annualProfit).toBeCloseTo(r.rows[0].profit + r.rows[1].profit, 0)
        })

        it('calculates profit vs monoculture', () => {
            const r = calculateCropRotation(base)
            const mono = 60 * 120 - 4500
            expect(r.profitVsMonoculture).toBeCloseTo(r.annualProfit - mono, 0)
        })

        it('soy_only has no bonus and single row', () => {
            const r = calculateCropRotation({ ...base, system: 'soy_only' })
            expect(r.rows).toHaveLength(1)
            expect(r.rows[0].yield).toBe(60)
            expect(r.rotationBenefit).toBe(0)
        })

        it('soy_wheat labels second crop as Trigo', () => {
            const r = calculateCropRotation({ ...base, system: 'soy_wheat' })
            expect(r.rows[1].crop).toBe('Trigo')
        })

        it('soyMargin is 0 when soybeanPrice is 0', () => {
            const r = calculateCropRotation({ ...base, system: 'soy_only', soybeanPrice: 0 })
            expect(r.rows[0].margin).toBe(0)
        })

        it('rotation without second crop data produces only soy row', () => {
            const r = calculateCropRotation({ ...base, secondCropYield: undefined, secondCropPrice: undefined, secondCropCost: undefined })
            expect(r.rows).toHaveLength(1)
        })

        it('second crop margin is 0 when secondCropPrice is 0', () => {
            const r = calculateCropRotation({ ...base, secondCropPrice: 0 })
            expect(r.rows).toHaveLength(2)
            expect(r.rows[1].margin).toBe(0)
        })
    })

    describe('validateCropRotation', () => {
        it('passes', () => expect(validateCropRotation(base)).toBeNull())
        it('rejects zero soybean yield', () => expect(validateCropRotation({ ...base, soybeanYield: 0 })).not.toBeNull())
        it('rejects missing second crop when rotation', () =>
            expect(validateCropRotation({ ...base, secondCropYield: 0 })).not.toBeNull())
        it('rejects zero soybeanPrice', () =>
            expect(validateCropRotation({ ...base, soybeanPrice: 0 })).not.toBeNull())
        it('rejects negative soybeanCost', () =>
            expect(validateCropRotation({ ...base, soybeanCost: -1 })).not.toBeNull())
        it('rejects zero secondCropPrice', () =>
            expect(validateCropRotation({ ...base, secondCropPrice: 0 })).not.toBeNull())
        it('rejects undefined secondCropCost', () =>
            expect(validateCropRotation({ ...base, secondCropCost: undefined })).not.toBeNull())
    })
})
