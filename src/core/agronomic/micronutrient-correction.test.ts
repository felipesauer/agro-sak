import { describe, it, expect } from 'vitest'
import { calculateMicronutrientCorrection, classifyMicronutrient, validateMicronutrientCorrection } from './micronutrient-correction'

describe('micronutrient-correction', () => {
    describe('classifyMicronutrient', () => {
        it('zn < 0.5 is Baixo', () => expect(classifyMicronutrient('zn', 0.4)).toBe('Baixo'))
        it('zn 0.5-1.0 is Médio', () => expect(classifyMicronutrient('zn', 0.7)).toBe('Médio'))
        it('zn >= 1.0 is Alto', () => expect(classifyMicronutrient('zn', 1.5)).toBe('Alto'))
        it('b < 0.2 is Baixo', () => expect(classifyMicronutrient('b', 0.1)).toBe('Baixo'))
    })

    describe('calculateMicronutrientCorrection', () => {
        it('returns 4 nutrients', () => {
            const r = calculateMicronutrientCorrection({ crop: 'soybean', areaHa: 100, zn: 0.4, b: 0.15, cu: 0.5, mn: 2 })
            expect(r.nutrients).toHaveLength(4)
        })

        it('Baixo Zn for soybean = 6 kg/ha', () => {
            const r = calculateMicronutrientCorrection({ crop: 'soybean', areaHa: 100, zn: 0.3 })
            const zn = r.nutrients.find(n => n.symbol === 'Zn')!
            expect(zn.doseKgHa).toBe(6)
            expect(zn.totalKg).toBe(600)
        })

        it('Alto gives 0 dose', () => {
            const r = calculateMicronutrientCorrection({ crop: 'soybean', areaHa: 100, zn: 2.0 })
            const zn = r.nutrients.find(n => n.symbol === 'Zn')!
            expect(zn.doseKgHa).toBe(0)
        })

        it('coffee has higher doses', () => {
            const r = calculateMicronutrientCorrection({ crop: 'coffee', areaHa: 100, zn: 0.3 })
            const zn = r.nutrients.find(n => n.symbol === 'Zn')!
            expect(zn.doseKgHa).toBe(8)
        })
    })

    describe('validateMicronutrientCorrection', () => {
        it('passes', () => expect(validateMicronutrientCorrection({ crop: 'soybean', areaHa: 100, zn: 0.4 })).toBeNull())
        it('rejects no area', () => expect(validateMicronutrientCorrection({ crop: 'soybean', areaHa: 0, zn: 0.4 })).not.toBeNull())
        it('rejects no nutrients', () => expect(validateMicronutrientCorrection({ crop: 'soybean', areaHa: 100 })).not.toBeNull())
        it('rejects empty crop', () => expect(validateMicronutrientCorrection({ crop: '', areaHa: 100, zn: 0.5 })).not.toBeNull())
    })

    it('classifyMicronutrient returns Médio for unknown nutrient', () => {
        expect(classifyMicronutrient('fe', 5)).toBe('Médio')
    })

    it('calculateMicronutrientCorrection defaults dose to 0 for unknown crop', () => {
        const r = calculateMicronutrientCorrection({ crop: 'quinoa', areaHa: 100, zn: 0.3 })
        const zn = r.nutrients.find(n => n.symbol === 'Zn')!
        expect(zn.doseKgHa).toBe(0)
    })
})
