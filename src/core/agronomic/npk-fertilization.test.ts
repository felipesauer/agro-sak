import { describe, it, expect } from 'vitest'
import { calculateNpkFertilization, classifyLevel, validateNpkFertilization } from './npk-fertilization'

describe('npk-fertilization', () => {
    describe('classifyLevel', () => {
        it('returns 0 for value below first limit', () => expect(classifyLevel(2, [3, 6, 9, 18])).toBe(0))
        it('returns 1 for value in second range', () => expect(classifyLevel(5, [3, 6, 9, 18])).toBe(1))
        it('returns last index for high value', () => expect(classifyLevel(20, [3, 6, 9, 18])).toBe(4))
    })

    describe('calculateNpkFertilization', () => {
        it('soybean with low P recommends 120 P₂O₅', () => {
            const r = calculateNpkFertilization({ crop: 'soybean', texture: 'clay', pSoil: 2, kSoil: 90, inoculated: true })
            expect(r.pRec).toBe(120)
            expect(r.pLevel).toBe('Muito baixo')
        })

        it('soybean inoculated gets 0 N', () => {
            const r = calculateNpkFertilization({ crop: 'soybean', texture: 'clay', pSoil: 5, kSoil: 90, inoculated: true })
            expect(r.nRec).toBe(0)
        })

        it('soybean not inoculated gets 20 N', () => {
            const r = calculateNpkFertilization({ crop: 'soybean', texture: 'clay', pSoil: 5, kSoil: 90, inoculated: false })
            expect(r.nRec).toBe(20)
        })

        it('corn gets higher N', () => {
            const r = calculateNpkFertilization({ crop: 'corn', texture: 'clay', pSoil: 5, kSoil: 90, inoculated: true })
            expect(r.nRec).toBe(120)
        })

        it('custom mode returns custom values', () => {
            const r = calculateNpkFertilization({ crop: 'custom', texture: 'clay', pSoil: 0, kSoil: 0, inoculated: true, customN: 50, customP: 80, customK: 40 })
            expect(r.nRec).toBe(50)
            expect(r.pRec).toBe(80)
            expect(r.kRec).toBe(40)
            expect(r.pLevel).toBe('Personalizado')
        })

        it('returns top 3 formula matches', () => {
            const r = calculateNpkFertilization({ crop: 'soybean', texture: 'clay', pSoil: 5, kSoil: 40, inoculated: true })
            expect(r.formulas.length).toBeLessThanOrEqual(3)
            expect(r.formulas.length).toBeGreaterThan(0)
        })

        it('falls back to soybean tables for unknown crop', () => {
            const r = calculateNpkFertilization({ crop: 'quinoa', texture: 'clay', pSoil: 2, kSoil: 20, inoculated: true })
            const soy = calculateNpkFertilization({ crop: 'soybean', texture: 'clay', pSoil: 2, kSoil: 20, inoculated: true })
            expect(r.pRec).toBe(soy.pRec)
            expect(r.kRec).toBe(soy.kRec)
        })

        it('falls back to clay P classes for unknown texture', () => {
            const r = calculateNpkFertilization({ crop: 'soybean', texture: 'loam', pSoil: 2, kSoil: 90, inoculated: true })
            expect(r.pRec).toBe(120)
        })
    })

    describe('validateNpkFertilization', () => {
        it('passes', () =>
            expect(validateNpkFertilization({ crop: 'soybean', texture: 'clay', pSoil: 12, kSoil: 90, inoculated: true })).toBeNull())
        it('custom needs at least one nutrient', () =>
            expect(validateNpkFertilization({ crop: 'custom', texture: 'clay', pSoil: 0, kSoil: 0, inoculated: true })).not.toBeNull())
        it('valid custom with nutrients passes', () =>
            expect(validateNpkFertilization({ crop: 'custom', texture: 'clay', pSoil: 0, kSoil: 0, inoculated: true, customP: 80 })).toBeNull())
        it('rejects undefined pSoil', () =>
            expect(validateNpkFertilization({ crop: 'soybean', texture: 'clay', pSoil: undefined as never, kSoil: 90, inoculated: true })).not.toBeNull())
        it('rejects undefined kSoil', () =>
            expect(validateNpkFertilization({ crop: 'soybean', texture: 'clay', pSoil: 12, kSoil: undefined as never, inoculated: true })).not.toBeNull())
    })

    it('custom N-only hits nRec>0 filter and return false for no-N formulas', () => {
        const r = calculateNpkFertilization({ crop: 'custom', texture: 'clay', pSoil: 0, kSoil: 0, inoculated: true, customN: 50 })
        expect(r.nRec).toBe(50)
        expect(r.pRec).toBe(0)
        expect(r.kRec).toBe(0)
        expect(r.formulas.length).toBeGreaterThan(0)
        r.formulas.forEach(f => expect(f.nSupplied).toBeGreaterThan(0))
    })

    it('custom with no nutrients defaults all recs to 0', () => {
        const r = calculateNpkFertilization({ crop: 'custom', texture: 'clay', pSoil: 0, kSoil: 0, inoculated: true })
        expect(r.nRec).toBe(0)
        expect(r.pRec).toBe(0)
        expect(r.kRec).toBe(0)
    })
})
