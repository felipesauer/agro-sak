import { describe, it, expect } from 'vitest'
import { calculateGypsum, validateGypsum } from './gypsum'

describe('gypsum', () => {
    const base = {
        method: 'sousa' as const,
        Ca: 0.3,
        Mg: 0.2,
        Al: 0.8,
        ctc: 5,
        clayPercent: 40,
        targetDepthCm: 20,
        areaHa: 200,
        gypPricePerTon: 250,
    }

    describe('calculateGypsum', () => {
        it('sousa: NG = 50 * clay', () => {
            const r = calculateGypsum(base)!
            expect(r.gypsumNeedKgHa).toBe(2000) // 50 * 40
        })

        it('clay method: NG = 75 * clay', () => {
            const r = calculateGypsum({ ...base, method: 'clay' })!
            expect(r.gypsumNeedKgHa).toBe(3000) // 75 * 40
        })

        it('raij: NG = 6 * CTC_mmolc', () => {
            const r = calculateGypsum({ ...base, method: 'raij' })!
            expect(r.gypsumNeedKgHa).toBe(300) // 6 * 50
        })

        it('adjusts for depth', () => {
            const r = calculateGypsum({ ...base, targetDepthCm: 40 })!
            expect(r.gypsumNeedKgHa).toBe(4000) // 2000 * 2
        })

        it('calculates total tons and cost', () => {
            const r = calculateGypsum(base)!
            expect(r.gypsumNeedTHa).toBe(2)
            expect(r.totalTons).toBe(400)
            expect(r.costPerHa).toBe(500)
            expect(r.totalCost).toBe(100_000)
        })

        it('justified when Ca < 0.5', () => {
            const r = calculateGypsum(base)!
            expect(r.justified).toBe(true)
        })

        it('not justified when all adequate', () => {
            // Ca >= 0.5, Al <= 0.5, Ca/CTC >= 25%, Ca+Mg >= 1.0
            const r = calculateGypsum({ ...base, Ca: 3.0, Al: 0.2, Mg: 1.0, ctc: 8 })!
            expect(r.justified).toBe(false)
        })

        it('returns null if clay missing for sousa', () => {
            expect(calculateGypsum({ ...base, clayPercent: 0 })).toBeNull()
        })
    })

    describe('validateGypsum', () => {
        it('passes', () => expect(validateGypsum(base)).toBeNull())
        it('rejects zero area', () => expect(validateGypsum({ ...base, areaHa: 0 })).not.toBeNull())
        it('raij needs CTC', () =>
            expect(validateGypsum({ ...base, method: 'raij', ctc: undefined })).not.toBeNull())
        it('rejects Ca < 0', () =>
            expect(validateGypsum({ ...base, Ca: -1 })).not.toBeNull())
        it('rejects clay method without clayPercent', () =>
            expect(validateGypsum({ ...base, method: 'clay', clayPercent: undefined })).not.toBeNull())
    })

    it('returns null for clay method when clayPercent=0', () => {
        expect(calculateGypsum({ ...base, method: 'clay', clayPercent: 0 })).toBeNull()
    })

    it('returns null for raij method when ctc=0', () => {
        expect(calculateGypsum({ ...base, method: 'raij', ctc: 0 })).toBeNull()
    })

    it('justified only via lowCaCTC', () => {
        const r = calculateGypsum({ ...base, Ca: 0.8, Al: 0.1, Mg: 1.0, ctc: 4 })!
        expect(r.justified).toBe(true)
        expect(r.reasons).toContain('Saturação de Ca na CTC < 25%')
    })

    it('justified only via lowCaMg', () => {
        const r = calculateGypsum({ ...base, Ca: 0.6, Al: 0.1, Mg: 0.2, ctc: 10 })!
        expect(r.justified).toBe(true)
        expect(r.reasons).toContain('Ca + Mg baixo')
    })
})
