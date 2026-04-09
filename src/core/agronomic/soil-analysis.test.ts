import { describe, it, expect } from 'vitest'
import { calculateSoilAnalysis, validateSoilAnalysis } from './soil-analysis'
import type { SoilNutrientClassifier } from './soil-analysis'

// Simple mock classifier
const mockClassify: SoilNutrientClassifier = (nutrient, value) => {
    if (nutrient === 'pH') {
        if (value < 4.5) return { label: 'Muito baixo', color: 'red' }
        if (value < 5.5) return { label: 'Baixo', color: 'amber' }
        return { label: 'Adequado', color: 'emerald' }
    }
    if (nutrient === 'P') {
        if (value < 6) return { label: 'Baixo', color: 'red' }
        if (value < 18) return { label: 'Médio', color: 'yellow' }
        return { label: 'Alto', color: 'emerald' }
    }
    return { label: 'Adequado', color: 'emerald' }
}

describe('soil-analysis', () => {
    describe('calculateSoilAnalysis', () => {
        it('classifies nutrients using provided classifier', () => {
            const r = calculateSoilAnalysis({ pH: 4.2, P: 3 }, mockClassify)
            expect(r.nutrients).toHaveLength(2)
            expect(r.nutrients[0].label).toBe('Muito baixo')
            expect(r.nutrients[1].label).toBe('Baixo')
        })

        it('counts critical and warning', () => {
            const r = calculateSoilAnalysis({ pH: 4.2, P: 12 }, mockClassify)
            expect(r.criticalCount).toBe(1) // pH red
            expect(r.warningCount).toBe(1)  // P yellow
        })

        it('calculates CTC', () => {
            const r = calculateSoilAnalysis({ Ca: 30, Mg: 10, K: 2.5, hAl: 38 }, mockClassify)
            expect(r.ctc).toBeCloseTo(80.5, 1)
        })

        it('calculates base saturation', () => {
            const r = calculateSoilAnalysis({ Ca: 30, Mg: 10, K: 2.5, hAl: 38 }, mockClassify)
            // V% = (30+10+2.5) / 80.5 * 100 = 52.8
            expect(r.baseSaturation).toBeCloseTo(52.8, 0)
        })

        it('calculates Ca/Mg ratio', () => {
            const r = calculateSoilAnalysis({ Ca: 30, Mg: 10, K: 2.5, hAl: 38 }, mockClassify)
            expect(r.caMgRatio).toBe(3)
        })

        it('skips undefined nutrients', () => {
            const r = calculateSoilAnalysis({ pH: 5.5 }, mockClassify)
            expect(r.nutrients).toHaveLength(1)
        })
    })

    describe('validateSoilAnalysis', () => {
        it('passes with 3+ params', () =>
            expect(validateSoilAnalysis({ pH: 5.2, Ca: 30, Mg: 10 })).toBeNull())
        it('rejects fewer than 3', () =>
            expect(validateSoilAnalysis({ pH: 5.2 })).not.toBeNull())
        it('rejects negative values', () =>
            expect(validateSoilAnalysis({ pH: 5.2, Ca: -1, Mg: 10 })).not.toBeNull())
        it('rejects negative value for key not in NUTRIENT_DISPLAY', () => {
            const msg = validateSoilAnalysis({ pH: 5, Ca: 5, Mg: 5, hAl: -1 })
            expect(msg).toContain('hAl')
        })
    })

    it('skips nutrient when classifier returns null', () => {
        const nullClassify: SoilNutrientClassifier = () => null
        const r = calculateSoilAnalysis({ pH: 5.5, P: 10 }, nullClassify)
        expect(r.nutrients).toHaveLength(0)
    })
})
